import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import compression from "compression";
import { addProject, getProjects, updateProject, getProjectById, logAuditEvent, getUserProfile, createUserProfile, updateUserProfileRole, getAllUserProfiles } from "./server/db.js";
import { getSupabase } from "./server/supabase.js";
import { getExtraData, updateQuote, addAssetFile } from "./server/extra_store.js";
import { verifyPaymentSignature, verifyWebhookSignature, getRazorpayInstance } from "./server/razorpay.js";
import { sendEmailAsync, getProjectCreatedTemplate, getPaymentSuccessTemplate, getPortalActivatedTemplate, getDeliverablesReadyTemplate } from "./server/email.js";
import { withRetry } from "./server/retry.js";
import {
  triggerStatusChangeAutomation,
  triggerAdminNotification,
  initializeAutomationScheduler,
  runPeriodicAutomationScan
} from "./server/automation.js";
import fs from "fs";
import os from "os";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { logger } from "./server/logger.js";
import {
  validateBody,
  validateQuery,
  validateProjectIdParam,
  createProjectSchema,
  getProjectsQuerySchema,
  authSchema,
  updateProjectSchema,
  saveQuoteSchema,
  createOrderSchema,
  verifyPaymentSchema,
  uploadAssetSchema,
  adminVerifySchema,
  recommendationSchema,
  packageUpgradeSchema
} from "./server/validator.js";
import {
  requestTimeout,
  checkAbort,
  simulateDelayMiddleware
} from "./server/timeout.js";
import { cache } from "./server/cache.js";

dotenv.config();

const app = express();
app.use(compression());
const PORT = 3000;

// Whitelist of allowed MIME types for Secure Upload Engine
const MIME_WHITELIST = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// Validate Magic Bytes against MIME Type
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/png") {
    return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  if (mimeType === "image/gif") {
    return buffer.length >= 4 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  if (mimeType === "application/pdf") {
    return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  if (mimeType === "image/webp") {
    return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  }
  if (mimeType === "image/svg+xml" || mimeType === "text/plain") {
    for (let i = 0; i < Math.min(buffer.length, 100); i++) {
      const char = buffer[i];
      if (char < 9 || (char > 13 && char < 32)) {
        return false;
      }
    }
    return true;
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  if (mimeType === "application/msword") {
    return buffer.length >= 8 && buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
  }
  return true;
}

// Constant-time string comparison function to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// JWT Authentication Middleware with fallback to admin password bypass
async function requireAuth(req: any, res: any, next: any) {
  if (res.headersSent || req.timedOut || req.clientDisconnected) return;
  try {
    const adminPassword = req.headers["x-admin-password"];
    const actualPassword = process.env.ADMIN_PASSWORD;

    if (actualPassword && adminPassword && safeCompare(adminPassword, actualPassword)) {
      req.isAdmin = true;
      req.user = {
        id: "admin-bypass",
        email: "admin@codefuser.com",
        role: "super_admin",
        fullName: "System Bypass",
        businessName: "CodeFuser Admin"
      };
      return next();
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication required. Missing token." });
    }

    const token = authHeader.split(" ")[1];
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ success: false, error: "Server authentication error: Supabase credentials are not configured." });
    }

    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: { user }, error } = await tempClient.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: "Authentication failed: Invalid or expired token." });
    }

    // Secure Profile Retrieval with auto-creation (lazy migration for OAuth / older sign-ups)
    let profile = await getUserProfile(user.id, req.reqId);
    if (!profile) {
      console.log(`Lazy creating user profile for authenticated user: ${user.id} (${user.email})`);
      profile = await createUserProfile({
        id: user.id,
        email: user.email || "",
        role: "client",
        fullName: user.user_metadata?.full_name || "",
        businessName: user.user_metadata?.business_name || ""
      }, req.reqId);
    }

    req.user = {
      ...user,
      role: profile.role,
      fullName: profile.fullName,
      businessName: profile.businessName
    };
    req.isAdmin = (profile.role === "super_admin" || profile.role === "admin");
    next();
  } catch (err: any) {
    logger.error("Authentication middleware error", err);
    return res.status(401).json({ success: false, error: "Authentication failed." });
  }
}

// Role-Based Access Control (RBAC) Enforcement Middleware
function requireRole(allowedRoles: ("super_admin" | "admin" | "client")[]) {
  return (req: any, res: any, next: any) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied: Required role not met (required: ${allowedRoles.join(" or ")}, present: ${user.role}).` 
      });
    }

    next();
  };
}

// Project Ownership Authorization Middleware with Auto-binding support
async function verifyProjectOwnership(req: any, res: any, next: any) {
  if (res.headersSent || req.timedOut || req.clientDisconnected) return;
  try {
    if (req.isAdmin) {
      return next();
    }

    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication required." });
    }

    let hasAccess = false;

    // 1. Explicit authenticated user ID match
    if (project.userId && project.userId === user.id) {
      hasAccess = true;
    }
    // 2. Email fallback with auto-binding lazy migration (binds projects permanently)
    else if (!project.userId && project.email && project.email.trim().toLowerCase() === user.email.trim().toLowerCase()) {
      hasAccess = true;
      console.log(`Lazy migrating project ${projectId}: permanent binding to owner user ID ${user.id}`);
      try {
        await updateProject(projectId, { userId: user.id }, req.reqId);
        project.userId = user.id; // update local context
      } catch (err) {
        logger.error(`Failed to automatically bind user ${user.id} to project ${projectId}`, err);
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, error: "Access denied: You do not own this project." });
    }

    req.project = project;
    next();
  } catch (err: any) {
    logger.error("Ownership verification error", err);
    return res.status(500).json({ success: false, error: "Internal server error during authorization." });
  }
}

// Request-Response logging middleware using structured JSON logger
app.use((req: any, res: any, next) => {
  const start = Date.now();
  const reqId = crypto.randomUUID();
  req.reqId = reqId;

  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    reqId,
    method: req.method,
    url: req.url,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1",
    userAgent: req.headers["user-agent"],
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`Response completed: ${req.method} ${req.url} [${res.statusCode}]`, {
      reqId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
});

// Explicit Production Security Headers Middleware
app.use((req, res, next) => {
  // Content-Security-Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob: https://*.supabase.co https://*.google.com https://*.googleusercontent.com https://checkout.razorpay.com; " +
    "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://checkout.razorpay.com; " +
    "frame-src 'self' https://checkout.razorpay.com; " +
    "frame-ancestors 'self' https://ai.studio https://*.google.com https://*.google.com/aistudio;"
  );

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  // Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Strict-Transport-Security (HSTS)
  if (process.env.NODE_ENV === "production" || !!process.env.VERCEL) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
});

// Custom in-memory rate limiting implementation
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore: Record<string, Record<string, RateLimitRecord>> = {};

function createRateLimiter(windowMs: number, max: number, message: string) {
  return (req: any, res: any, next: any) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    // Normalize path by replacing dynamic IDs with placeholder to avoid key explosion
    let routeKey = req.baseUrl + req.path;
    if (req.params && req.params.id) {
      routeKey = routeKey.replace(req.params.id, ":id");
    }
    const now = Date.now();

    if (!rateLimitStore[routeKey]) {
      rateLimitStore[routeKey] = {};
    }

    const clientRecord = rateLimitStore[routeKey][ip];

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitStore[routeKey][ip] = {
        count: 1,
        resetTime: now + windowMs,
      };
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", max - 1);
      res.setHeader("X-RateLimit-Reset", Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (clientRecord.count >= max) {
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(clientRecord.resetTime / 1000));
      res.setHeader("Retry-After", Math.ceil((clientRecord.resetTime - now) / 1000));
      return res.status(429).json({ success: false, error: message });
    }

    clientRecord.count++;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", max - clientRecord.count);
    res.setHeader("X-RateLimit-Reset", Math.ceil(clientRecord.resetTime / 1000));
    next();
  };
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const routeKey of Object.keys(rateLimitStore)) {
    for (const ip of Object.keys(rateLimitStore[routeKey])) {
      if (now > rateLimitStore[routeKey][ip].resetTime) {
        delete rateLimitStore[routeKey][ip];
      }
    }
    if (Object.keys(rateLimitStore[routeKey]).length === 0) {
      delete rateLimitStore[routeKey];
    }
  }
}, 5 * 60 * 1000);

const adminRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  15,
  "Too many administrative authentication attempts. Please try again in 15 minutes."
);

const projectsRateLimiter = createRateLimiter(
  1 * 60 * 1000,
  100,
  "Too many project request attempts. Please slow down."
);

const uploadRateLimiter = createRateLimiter(
  5 * 60 * 1000,
  10,
  "Too many asset upload attempts. Please try again later."
);

const paymentVerificationRateLimiter = createRateLimiter(
  5 * 60 * 1000,
  15,
  "Too many payment verification attempts. Please try again later."
);

const webhookRateLimiter = createRateLimiter(
  1 * 60 * 1000,
  120,
  "Too many webhook delivery requests. Please slow down."
);

// Request body parser with 50mb limit for base64 file uploads and raw body capture for webhook signature verification
app.use(express.json({
  limit: "50mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Global dynamic request timeout middleware applied to all /api routes
app.use("/api", (req: any, res: any, next: any) => {
  let timeoutMs = 15000; // Default 15 seconds
  let operationName = "API Operation";

  const url = req.path || "";
  if (url.includes("/upload")) {
    timeoutMs = 45000;
    operationName = "Asset Upload";
  } else if (url.includes("/recommendation")) {
    timeoutMs = 45000;
    operationName = "AI Recommendation";
  } else if (url.includes("/package-upgrade-options")) {
    timeoutMs = 45000;
    operationName = "AI Upgrade Options";
  } else if (url.includes("/razorpay-order") || url.includes("/verify-payment")) {
    timeoutMs = 25000;
    operationName = "Razorpay Transaction";
  }

  requestTimeout(timeoutMs, operationName)(req, res, next);
});

app.use(simulateDelayMiddleware);

// Serve uploaded files statically. On Vercel, process.cwd() is read-only.
// We use a writable temporary directory in serverless/production to avoid read-only filesystem issues,
// and local public/uploads for local development. We do NOT mutate the filesystem in /public on startup.
const isVercel = !!process.env.VERCEL;
const uploadsDir = isVercel 
  ? path.join(os.tmpdir(), "uploads")
  : path.join(process.cwd(), "public", "uploads");

app.use("/uploads", express.static(uploadsDir));

// API: Validate Step 1 uniqueness
app.post("/api/projects/validate-step1", projectsRateLimiter, async (req: any, res) => {
  try {
    const { email, whatsapp, userId } = req.body;
    
    // Check validation cache to prevent repeated database lookup overhead
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedWhatsapp = String(whatsapp || "").trim().replace(/\s+/g, "");
    const cacheKey = `validate:step1:${normalizedEmail}:${normalizedWhatsapp}:${String(userId || "")}`;
    
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.info(`[PERF] Step 1 validation cache hit! Key: ${cacheKey}`);
      return res.json(JSON.parse(cachedResult));
    }

    const supabase = getSupabase();

    // 1. Check whether the user already owns an active CodeFuser project.
    if (userId && typeof userId === "string" && userId !== "admin-bypass" && userId.trim() !== "") {
      const { data: userMatch, error: userErr } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", userId);

      if (userErr) {
        throw new Error(`Database error during ownership check: ${userErr.message}`);
      }

      if (userMatch && userMatch.length > 0) {
        const result = {
          duplicate: true,
          reason: "active_project",
          message: "This account already owns an active CodeFuser project."
        };
        await cache.set(cacheKey, JSON.stringify(result), 30);
        return res.json(result);
      }
    }

    // 2. Check whether the Email Address already exists.
    if (email && typeof email === "string" && email.trim() !== "") {
      const cleanEmail = email.trim().toLowerCase();
      const { data: emailMatch, error: emailErr } = await supabase
        .from("projects")
        .select("id, email")
        .eq("email", cleanEmail);

      if (emailErr) {
        throw new Error(`Database error during email check: ${emailErr.message}`);
      }

      if (emailMatch && emailMatch.length > 0) {
        const result = {
          duplicate: true,
          reason: "email",
          message: "This email address is already linked to an existing CodeFuser project."
        };
        await cache.set(cacheKey, JSON.stringify(result), 30);
        return res.json(result);
      }
    }

    // 3. Check whether the WhatsApp Number already exists.
    if (whatsapp && typeof whatsapp === "string" && whatsapp.trim() !== "") {
      const cleanWhatsapp = whatsapp.replace(/\s+/g, ""); // strip all whitespace for normalized comparison
      const { data: allProjects, error: whatsappErr } = await supabase
        .from("projects")
        .select("id, whatsapp");

      if (whatsappErr) {
        throw new Error(`Database error during WhatsApp check: ${whatsappErr.message}`);
      }

      if (allProjects) {
        for (const p of allProjects) {
          if (p.whatsapp) {
            const dbClean = p.whatsapp.replace(/\s+/g, "");
            if (dbClean === cleanWhatsapp || p.whatsapp.trim() === whatsapp.trim()) {
              const result = {
                duplicate: true,
                reason: "whatsapp",
                message: "This WhatsApp number is already registered with CodeFuser."
              };
              await cache.set(cacheKey, JSON.stringify(result), 30);
              return res.json(result);
            }
          }
        }
      }
    }

    const successResult = {
      duplicate: false
    };
    await cache.set(cacheKey, JSON.stringify(successResult), 30);
    return res.json(successResult);
  } catch (error: any) {
    console.error("Step 1 validation error:", error);
    return res.status(500).json({ error: "Unable to complete validation check. Please try again later." });
  }
});

// API: Create new project
app.post("/api/projects", projectsRateLimiter, validateBody(createProjectSchema), async (req: any, res) => {
  try {
    const {
      ownerName,
      businessName,
      email,
      whatsapp,
      packageId,
      ownership,
      industry,
      customIndustry,
      goal,
      customGoal,
      hasDomain,
      hasLogo,
      contentReady,
      userId,
      aiPrompt
    } = req.body;

    // Validate required fields
    if (!ownerName || !businessName || !email || !whatsapp) {
      return res.status(400).json({ error: "Required fields (ownerName, businessName, email, whatsapp) are missing." });
    }

    const payload = {
      clientName: ownerName,
      businessName,
      email,
      whatsapp,
      selectedPackage: packageId,
      ownershipChoice: ownership,
      industry: industry || "",
      customIndustry: customIndustry || "",
      goal: goal || "",
      customGoal: customGoal || "",
      hasDomain: hasDomain || "",
      hasLogo: hasLogo || "",
      contentReady: contentReady || "",
      userId: userId || "",
      aiPrompt: aiPrompt || ""
    };

    checkAbort(req);

    console.log("Compiling and initializing project in CodeFuser Core architecture style...");
    const savedProject = await addProject(payload, req.reqId);

    // Track business event in Audit Trail
    await logAuditEvent({
      projectId: savedProject.id,
      eventType: "Project Created",
      requestId: req.reqId,
      actor: "Client",
      status: "Success",
      notes: `Project filed for ${savedProject.businessName} (package: ${savedProject.selectedPackage})`
    });

    // Send Project Created Email Notification asynchronously
    const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
    const portalUrl = `${devUrl}/login`;
    const emailHtml = getProjectCreatedTemplate(
      savedProject.clientName,
      savedProject.businessName,
      savedProject.selectedPackage,
      portalUrl
    );
    sendEmailAsync(savedProject.email, `Welcome to CodeFuser - ${savedProject.businessName} Project Filed`, emailHtml);
    
    // Dispatch Internal Admin Alert
    triggerAdminNotification(
      "New Project Filed",
      `A new system project spec has been registered for ${savedProject.businessName} by ${savedProject.clientName}.`,
      {
        "Project ID": savedProject.id,
        "Client Name": savedProject.clientName,
        "Business Name": savedProject.businessName,
        "Selected Tier": savedProject.selectedPackage,
        "Industry": savedProject.industry || "Not Specified",
        "Email": savedProject.email,
        "WhatsApp": savedProject.whatsapp
      },
      req.reqId
    );

    if (res.headersSent || req.timedOut) return;

    return res.status(201).json({
      success: true,
      data: savedProject,
      message: "Project compiled and registered successfully under Core flow."
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to compile project submission in core backend:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Get all active projects (with secure authenticated filtering support)
app.get("/api/projects", requestTimeout(10000, "Get Projects"), requireAuth, projectsRateLimiter, validateQuery(getProjectsQuerySchema), async (req: any, res) => {
  try {
    const { userId, email } = req.query;
    checkAbort(req);
    
    if (req.isAdmin) {
      // Admins can query all projects, or filter by a specific user/email directly in the database
      const filter = (userId || email) ? { userId: userId ? String(userId) : undefined, email: email ? String(email) : undefined } : undefined;
      const projects = await getProjects(req.reqId, filter);
      
      if (res.headersSent || req.timedOut) return;
      return res.json({ projects });
    }
    
    // Regular authenticated user: can ONLY retrieve projects linked to their authenticated session.
    // Query matching rows directly from Postgres/Supabase for security and high performance.
    const projects = await getProjects(req.reqId, {
      userId: req.user.id,
      email: req.user.email
    });
    
    if (res.headersSent || req.timedOut) return;
    return res.json({ projects });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to load project database items:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Customer Registration (SignUp Proxy)
app.post("/api/auth/signup", requestTimeout(10000, "Auth Signup"), validateBody(authSchema), async (req: any, res) => {
  try {
    const { email, password, fullName, businessName } = req.body;
    checkAbort(req);
    const supabase = getSupabase();
    
    // Create authentication record in Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (res.headersSent || req.timedOut) return;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    if (data.user) {
      console.log(`Creating database profile for newly registered user: ${data.user.id}`);
      // Store custom user profile in DB
      await createUserProfile({
        id: data.user.id,
        email: data.user.email || email,
        role: "client", // New signups default to client
        fullName: fullName || "",
        businessName: businessName || ""
      }, req.reqId);
    }

    return res.json({ success: true, user: data.user, session: data.session });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Signup error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to sign up." });
  }
});

// API: Customer Authentication (Login Proxy)
app.post("/api/auth/login", requestTimeout(10000, "Auth Login"), validateBody(authSchema), async (req: any, res) => {
  try {
    const { email, password } = req.body;
    checkAbort(req);
    const supabase = getSupabase();
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (res.headersSent || req.timedOut) return;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    let userRole = "client";
    let fullName = "";
    let businessName = "";

    if (data.user) {
      // Find or lazily migrate user profile to Database
      let profile = await getUserProfile(data.user.id, req.reqId);
      if (!profile) {
        console.log(`Lazy creating missing database profile for logging-in user: ${data.user.id}`);
        profile = await createUserProfile({
          id: data.user.id,
          email: data.user.email || email,
          role: "client",
          fullName: data.user.user_metadata?.full_name || "",
          businessName: data.user.user_metadata?.business_name || ""
        }, req.reqId);
      }
      userRole = profile.role;
      fullName = profile.fullName || "";
      businessName = profile.businessName || "";
    }

    return res.json({ 
      success: true, 
      user: data.user ? { ...data.user, role: userRole, fullName, businessName } : null, 
      session: data.session 
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Login error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log in." });
  }
});

// API: Customer Logout Proxy
app.post("/api/auth/logout", requestTimeout(10000, "Auth Logout"), async (req, res) => {
  try {
    checkAbort(req);
    const supabase = getSupabase();
    await supabase.auth.signOut();
    
    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Auth Logout error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log out." });
  }
});

// API: Retrieve Current User Profile (Secure Profile & Role Sync)
app.get("/api/auth/me", requestTimeout(10000, "Get Current User Profile"), requireAuth, async (req: any, res) => {
  try {
    return res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        fullName: req.user.fullName,
        businessName: req.user.businessName
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Failed to retrieve current user profile." });
  }
});

// API: Get all user profiles (Admin/Super Admin only)
app.get("/api/admin/users", requestTimeout(10000, "Get All Users"), requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    checkAbort(req);
    const users = await getAllUserProfiles(req.reqId);
    if (res.headersSent || req.timedOut) return;
    return res.json({ success: true, users });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to fetch user profiles:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve user profiles." });
  }
});

// API: Update user role (Super Admin only)
app.put("/api/admin/users/:id/role", requestTimeout(10000, "Update User Role"), requireAuth, requireRole(["super_admin"]), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["super_admin", "admin", "client"].includes(role)) {
      return res.status(400).json({ success: false, error: "Invalid role specified. Must be 'super_admin', 'admin', or 'client'." });
    }

    checkAbort(req);
    const updatedProfile = await updateUserProfileRole(id, role, req.reqId);
    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      user: updatedProfile,
      message: `User role updated to ${role} successfully.` 
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error(`Failed to update user role for ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: "Failed to update user role." });
  }
});

// API: Trigger administrative manual automation scan (Admin/Super Admin only)
app.post("/api/admin/automation/scan", requestTimeout(15000, "Automation Scan"), requireAuth, requireRole(["super_admin", "admin"]), async (req: any, res) => {
  try {
    checkAbort(req);
    const stats = await runPeriodicAutomationScan(`admin-manual-${req.user?.id || "unknown"}`);
    if (res.headersSent || req.timedOut) return;
    return res.json({
      success: true,
      stats,
      message: "Periodic commercial automation scan triggered and completed successfully."
    });
  } catch (err: any) {
    if (res.headersSent) return;
    return res.status(500).json({ success: false, error: err.message || "Failed to execute manual scan." });
  }
});

// (Obsolete server-side OAuth endpoints are replaced by Vercel-compatible direct client-side Supabase authentication flow)

// API: Update a single project state
app.put("/api/projects/:id", requestTimeout(10000, "Update Project"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(updateProjectSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const restrictedFields = [
      "paymentStatus",
      "portalAccess",
      "portalAccessSource",
      "paymentId",
      "orderId",
      "paymentProvider",
      "purchaseDate",
      "purchasedPlan"
    ];

    const hasRestrictedField = Object.keys(updates || {}).some(key => restrictedFields.includes(key));
    if (hasRestrictedField && !req.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized: Modifying payment status or authorization parameters is restricted to authenticated administrators." 
      });
    }

    checkAbort(req);

    const previousProject = await getProjectById(id);
    if (!previousProject) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const updated = await updateProject(id, updates, req.reqId);

    // Check if Portal Access is activated
    const portalAccessActivated = !previousProject.portalAccess && updated.portalAccess;
    if (portalAccessActivated) {
      await logAuditEvent({
        projectId: id,
        eventType: "Portal Activated",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: "Client portal manually authorized and activated by administrator."
      });

      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const emailHtml = getPortalActivatedTemplate(updated.clientName, updated.businessName, portalUrl);
      sendEmailAsync(updated.email, `Client Portal Activated - ${updated.businessName}`, emailHtml);
    } else if (previousProject.portalAccess && !updated.portalAccess) {
      // Portal Access Revoked
      await logAuditEvent({
        projectId: id,
        eventType: "Portal Access Revoked",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: "Client portal access manually revoked by administrator."
      });
    }

    // Check if Deliverables are ready
    const isDeliverablesReady = ["Checklist Ready", "Launched"].includes(updated.status) &&
      !["Checklist Ready", "Launched"].includes(previousProject.status);

    if (isDeliverablesReady) {
      await logAuditEvent({
        projectId: id,
        eventType: "Deliverables Ready",
        requestId: req.reqId,
        actor: "Admin",
        status: "Success",
        notes: `Project status updated to: ${updated.status}. Deliverables ready.`
      });

      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const emailHtml = getDeliverablesReadyTemplate(updated.clientName, updated.businessName, portalUrl);
      sendEmailAsync(updated.email, `Your CodeFuser Project Deliverables are Ready!`, emailHtml);
    } else if (updates.status && updates.status !== previousProject.status) {
      // General status update log
      await logAuditEvent({
        projectId: id,
        eventType: "Status Updated",
        requestId: req.reqId,
        actor: req.isAdmin ? "Admin" : "System",
        status: "Success",
        notes: `Status changed from '${previousProject.status}' to '${updated.status}'`
      });

      // Trigger Advanced status change automation workflow (Design, Development, Testing, etc.)
      triggerStatusChangeAutomation(id, previousProject.status, updated.status, req.reqId);
    }

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: updated, message: "Project updated successfully in the core database." });
  } catch (error: any) {
    if (res.headersSent) return;
    logger.error("Failed to update project status / elements", error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// API: Get extra project data (Quote and Uploaded Assets)
app.get("/api/projects/:id/extra", requestTimeout(10000, "Get Extra Project Data"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);
    const extra = await getExtraData(id);

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: extra });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to get extra project data", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save/Lock Official Quote for a project
app.post("/api/projects/:id/quote", requestTimeout(10000, "Save Quote"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(saveQuoteSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { packageName, price, discount, features, summary } = req.body;

    checkAbort(req);

    const extra = await updateQuote(id, {
      packageName,
      price: Number(price),
      discount: Number(discount || 0),
      features: features || [],
      summary: summary || ""
    });

    // Log quote generation event
    await logAuditEvent({
      projectId: id,
      eventType: "Quote Generated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: `Generated quote for standard tier: ${packageName} at Rs. ${price}`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Official Quote locked successfully. Standard price frozen for 7 days." 
    });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to update quote", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Unlock/Reset Quote for generating new recommendation
app.post("/api/projects/:id/quote/reset", requestTimeout(10000, "Reset Quote"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);
    const extra = await updateQuote(id, null);

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: extra, message: "Existing quotation has been unlocked." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to reset quote", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Generate AI Proposal manually
app.post("/api/projects/:id/proposal/generate", requestTimeout(25000, "Generate Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    checkAbort(req);

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const supabase = getSupabase();
    const { data: projData } = await supabase
      .from("projects")
      .select("quote")
      .eq("id", id)
      .single();

    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || null;

    // Preserve manual edits unless force parameter is provided
    if (existingProposal && existingProposal.manualEdits && force !== "true") {
      return res.json({
        success: false,
        requireConfirmation: true,
        message: "Existing administrator edits were detected. Regenerating will overwrite manual changes. Do you want to proceed?"
      });
    }

    let proposalContent = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const systemPrompt = `You are an elite enterprise-grade technology consultant, CTO, and digital business architect at CodeFuser.
Your goal is to produce a high-impact, professional, consulting-grade strategic digital blueprint and proposal.
Focus on clear structure, crisp professional insights, and business outcomes. Avoid generic conversational fluff or introductory padding.
Format using standard Markdown with beautiful headers.
Include the following structured sections:
1. Executive Strategy & Business Alignment (How the site directly addresses their specific goal)
2. Custom Architecture & Core Tech Stack (Tailored specifically for their target package and industry)
3. Progressive Development Roadmap & Milestones (Concrete, structured phases)
4. Interactive Platform Feature Blueprint (Clear list of essential custom components to be built)
5. Competitive Business ROI Score & Performance Diagnostics`;

        const userPrompt = `Generate an enterprise strategy proposal for:
- Client Name: ${project.clientName}
- Company/Brand Name: ${project.businessName}
- Primary Business Category/Industry: ${project.industry || project.customIndustry || "Not Specified"}
- Primary Core Goal: ${project.goal || project.customGoal || "Not Specified"}
- Selected Base Tier: ${project.selectedPackage}
- Setup Readiness: Logo (${project.hasLogo}), Domain (${project.hasDomain}), Content (${project.contentReady})
- Technology Ownership model: ${project.ownershipChoice}`;

        const response = await withRetry(async () => {
          return await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemPrompt,
            }
          });
        }, {
          reqId: req.reqId || "N/A",
          operationName: "Gemini generateContent Proposal (gemini-3.5-flash)",
          isIdempotent: true
        });

        if (response && response.text) {
          proposalContent = response.text;
        } else {
          throw new Error("Empty response from Gemini.");
        }
      } catch (geminiErr: any) {
        console.error("Gemini proposal generation failed, using fallback:", geminiErr);
        proposalContent = getDefaultProposalContent(project);
      }
    } else {
      console.warn("GEMINI_API_KEY not set. Using consulting fallback blueprint.");
      proposalContent = getDefaultProposalContent(project);
    }

    const updatedProposal = {
      content: proposalContent,
      status: "draft",
      manualEdits: null,
      timestamp: new Date().toISOString()
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    const { error: updateErr } = await supabase
      .from("projects")
      .update({ quote: updatedQuote })
      .eq("id", id);

    if (updateErr) {
      throw new Error(`Failed to update proposal in database: ${updateErr.message}`);
    }

    // Log the audit event
    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Generated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Generated strategic AI blueprint and proposal manually."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({
      success: true,
      data: extra,
      message: "AI Proposal and Strategic Blueprint generated successfully."
    });

  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to generate manual proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Helper function for fallback proposal content
function getDefaultProposalContent(project: any) {
  return `# Strategic Digital Blueprint & Technical Proposal
## 1. Executive Strategy & Business Alignment
For **${project.businessName}**, we are launching a modern, high-performance digital platform tailored specifically for the **${project.industry || project.customIndustry || "Specified"}** sector. The primary objective is to build a foundation that addresses your primary goal: *"${project.goal || project.customGoal || "Maximize operational efficiency"}"*.

## 2. Custom Architecture & Core Tech Stack
- **Frontend Core**: React 18 with Vite and Tailwind CSS, utilizing high-contrast design visual identities and motion layouts.
- **Backend Architecture**: Express proxy servers with secure row-level client endpoints.
- **Database Layer**: Durable Supabase PostgreSQL cloud storage with complete offline redundancy.

## 3. Progressive Development Roadmap
- **Sprint 1 (Layout & Branding)**: Asset collection, interactive layouts, visual board approval.
- **Sprint 2 (Database & Integrations)**: Secure checkout setup, customized dashboard features, backend models.
- **Sprint 3 (Deployment & QA)**: Performance optimization, domain testing, official deployment.

## 4. Interactive Platform Feature Blueprint
- Responsive cross-device interface.
- Complete payment gateway synchronization.
- Interactive dashboard for managing services.

## 5. Competitive Business ROI Score
- Bypasses standard boilerplate layout limits.
- Binds customers permanently via secure portal access.
- Fully optimizes client onboarding conversions.`;
}

// API: Save manual edits to proposal
app.post("/api/projects/:id/proposal/save", requestTimeout(10000, "Save Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      content: content !== undefined ? content : existingProposal.content,
      manualEdits: content !== undefined ? content : existingProposal.manualEdits,
      status: status !== undefined ? status : existingProposal.status,
      timestamp: new Date().toISOString()
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    const { error: updateErr } = await supabase
      .from("projects")
      .update({ quote: updatedQuote })
      .eq("id", id);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Updated",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Saved administrator edits to strategic proposal."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Strategic proposal saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Approve proposal
app.post("/api/projects/:id/proposal/approve", requestTimeout(10000, "Approve Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { content: "", status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      status: "approved"
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Approved",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Strategic proposal approved by administrator."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Proposal approved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to approve proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Send proposal to client
app.post("/api/projects/:id/proposal/send", requestTimeout(10000, "Send Proposal"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};
    const existingProposal = currentQuote.proposal || { content: "", status: "draft" };

    const updatedProposal = {
      ...existingProposal,
      status: "sent"
    };

    const updatedQuote = {
      ...currentQuote,
      proposal: updatedProposal
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Proposal Sent",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: "Strategic proposal officially sent to client portal."
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Proposal sent to client portal successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to send proposal", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save launch checklist
app.post("/api/projects/:id/checklist/save", requestTimeout(10000, "Save Checklist"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};

    const updatedQuote = {
      ...currentQuote,
      checklist: checklist || []
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Checklist Configured",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Configured launch checklist items (Total: ${checklist?.length || 0})`
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Launch checklist saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save checklist", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save deliverables
app.post("/api/projects/:id/deliverables/save", requestTimeout(10000, "Save Deliverables"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { deliverables } = req.body;
    checkAbort(req);

    const supabase = getSupabase();
    const { data: projData } = await supabase.from("projects").select("quote").eq("id", id).single();
    const currentQuote = projData?.quote || {};

    const updatedQuote = {
      ...currentQuote,
      deliverables: deliverables || []
    };

    await supabase.from("projects").update({ quote: updatedQuote }).eq("id", id);

    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Configured",
      requestId: req.reqId,
      actor: "Admin",
      status: "Success",
      notes: `Configured deliverables vault items (Total: ${deliverables?.length || 0})`
    });

    if (res.headersSent || req.timedOut) return;

    const extra = await getExtraData(id);
    return res.json({ success: true, data: extra, message: "Deliverables saved successfully." });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to save deliverables", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Get project audit trail (Mission Control Activity Tracker)
app.get("/api/projects/:id/audit-trail", requestTimeout(10000, "Get Audit Trail"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id } = req.params;
    checkAbort(req);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("audit_trail")
      .select("*")
      .eq("project_id", id)
      .order("timestamp", { ascending: false });

    if (error) {
      throw error;
    }

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, data: data || [] });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to retrieve project audit trail:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch audit trail." });
  }
});

// API: Generate secure signed download URL and track event
app.get("/api/projects/:id/assets/:assetId/download-url", requestTimeout(10000, "Get Download URL"), validateProjectIdParam, requireAuth, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { id, assetId } = req.params;
    checkAbort(req);

    const extra = await getExtraData(id);
    const asset = extra.assets.find(a => a.id === assetId);

    if (!asset) {
      return res.status(404).json({ success: false, error: "Asset not found." });
    }

    // Log the audit event!
    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Downloaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Downloaded file: ${asset.name} (${asset.type}, ${asset.size} bytes)`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({ success: true, url: asset.url });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to generate and track download URL", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process download." });
  }
});

// API: Expose Razorpay Public Key ID
app.get("/api/config/razorpay", (req, res) => {
  return res.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
    verificationModeActive: false
  });
});

// API: Create Razorpay Order
app.post("/api/projects/:id/razorpay-order", requestTimeout(15000, "Create Razorpay Order"), validateProjectIdParam, requireAuth, verifyProjectOwnership, projectsRateLimiter, validateBody(createOrderSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { term } = req.body; // 'milestone' | 'upfront'

    checkAbort(req);

    // Retrieve project by ID from pre-fetched request context
    const project = req.project;

    // Retrieve extra details (locked price)
    const extra = await getExtraData(id);
    let amountInRupees = 14999; // Default fallback
    let planName = "Fusion Package";

    if (extra && extra.quote) {
      planName = extra.quote.packageName || "Standard Package";
      const totalPrice = extra.quote.price;
      if (term === "upfront") {
        amountInRupees = Math.round(totalPrice * 0.9); // 10% incentive discount for 100% upfront payment
      } else {
        amountInRupees = Math.round(totalPrice * 0.5); // 50% upfront milestone
      }
    } else {
      // Fallback manual price calculation if quote is missing
      const packageId = project.selectedPackage || "growth";
      let basePrice = 14999;
      if (packageId === "foundation") basePrice = 7999;
      if (packageId === "dominance") basePrice = 34999;
      
      if (term === "upfront") {
        amountInRupees = Math.round(basePrice * 0.9); // 10% discount
      } else {
        amountInRupees = Math.round(basePrice * 0.5); // 50% milestone
      }
    }

    const amountInPaise = amountInRupees * 100;

    // Initialize lazy client and generate order
    const rzp = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${id.substring(0, 15)}_${Date.now().toString().substring(5)}`,
      notes: {
        projectId: id,
        planName,
        term,
        clientName: project.clientName || "",
        email: project.email || ""
      }
    };

    const order = await rzp.orders.create(options);

    // Log "Payment Started" to Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Payment Started",
      requestId: req.reqId,
      actor: "Client",
      status: "Success",
      notes: `Initiated checkout for term: ${term} and package: ${planName}. Amount: Rs. ${amountInRupees}`
    });

    if (res.headersSent || req.timedOut) return;

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      term,
      amountInRupees
    });
  } catch (error: any) {
    if (res.headersSent) return;
    logger.error("Failed to create Razorpay order", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to create payment order." });
  }
});

// API: Verify Razorpay Payment Signature (Client-side fast checkout verification)
app.post("/api/projects/:id/verify-payment", requestTimeout(15000, "Verify Razorpay Payment"), validateProjectIdParam, requireAuth, verifyProjectOwnership, paymentVerificationRateLimiter, validateBody(verifyPaymentSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, term } = req.body;

    checkAbort(req);

    // Validate Signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      logger.warn(`Payment signature verification failed for project ${id}`);
      return res.status(400).json({ success: false, error: "Invalid payment signature." });
    }

    // Retrieve project by ID from request context
    const project = req.project;

    const extra = await getExtraData(id);
    const planName = extra?.quote?.packageName || "Standard Package";
    
    // Check if project was already updated
    if (project.paymentStatus === "paid" && project.paymentId === razorpay_payment_id) {
      return res.json({
        success: true,
        message: "Payment already verified.",
        project
      });
    }

    const portalAccessSource = project.portalAccessSource || "automatic";
    const shouldGrantAccess = portalAccessSource === "manual" ? project.portalAccess : true;

    // Update project state in Supabase & Extra store supporting dual-milestone states
    const isFinalMilestone = term === "final";
    const nextPaymentStatus = (term === "upfront" || isFinalMilestone) ? "paid" : "partially_paid";
    const planDetailString = isFinalMilestone ? `${planName} (fully paid milestone)` : `${planName} (${term || "milestone"})`;

    const updates = {
      paymentStatus: nextPaymentStatus,
      portalAccess: shouldGrantAccess,
      paymentProvider: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      purchasedPlan: planDetailString,
      purchaseDate: new Date().toISOString(),
      portalAccessSource
    };

    checkAbort(req);

    const updatedProject = await updateProject(id, updates, req.reqId);

    // Track event in Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Payment Verified",
      requestId: req.reqId,
      actor: "Client",
      status: "Success",
      notes: `Verified payment of plan: ${updates.purchasedPlan}. Ref: ${razorpay_payment_id}`
    });

    if (shouldGrantAccess) {
      await logAuditEvent({
        projectId: id,
        eventType: "Portal Activated",
        requestId: req.reqId,
        actor: "System",
        status: "Success",
        notes: "Portal access automatically granted upon successful payment."
      });
    }

    // Send Receipt Email Notification
    const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
    const portalUrl = `${devUrl}/login`;
    const formattedAmount = term === "upfront" ? "Rs. " + (extra?.quote?.price ? (extra.quote.price * 0.9).toFixed(0) : "13,499") : "Rs. " + (extra?.quote?.price ? (extra.quote.price * 0.5).toFixed(0) : "7,499");
    const emailHtml = getPaymentSuccessTemplate(
      updatedProject.clientName,
      updatedProject.businessName,
      updates.purchasedPlan,
      razorpay_order_id,
      formattedAmount,
      portalUrl
    );
    sendEmailAsync(updatedProject.email, `Payment Confirmed - ${updatedProject.businessName}`, emailHtml);

    // Dispatch Internal Admin Alert
    triggerAdminNotification(
      "Payment Verified",
      `Successful checkout transaction has been completed and verified for project ${updatedProject.businessName}.`,
      {
        "Project ID": id,
        "Client Name": updatedProject.clientName,
        "Business Name": updatedProject.businessName,
        "Plan Purchased": updates.purchasedPlan,
        "Payment Ref": razorpay_payment_id,
        "Order Ref": razorpay_order_id,
        "Amount Verified": formattedAmount
      },
      req.reqId
    );

    if (res.headersSent || req.timedOut) return;

    return res.json({
      success: true,
      message: "Payment verified successfully. Portal access granted.",
      project: updatedProject
    });
  } catch (error: any) {
    if (res.headersSent) return;
    console.error("Failed to verify payment:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to verify payment." });
  }
});

// API: Razorpay Webhook Endpoint (Primary source-of-truth asynchronous processor)
app.post("/api/webhooks/razorpay", webhookRateLimiter, async (req: any, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ success: false, error: "Missing x-razorpay-signature header." });
    }

    const rawBody = req.rawBody ? req.rawBody.toString("utf-8") : "";
    
    // Verify Webhook Signature
    const isValid = verifyWebhookSignature(rawBody, String(signature));
    if (!isValid) {
      console.warn("Razorpay Webhook signature verification failed.");
      return res.status(400).json({ success: false, error: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody);
    console.log(`Razorpay webhook event received: ${event.event}`);

    // Support payment.captured and order.paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payload = event.payload;
      const orderData = payload.order?.entity;
      const paymentData = payload.payment?.entity;

      const notes = orderData?.notes || paymentData?.notes || {};
      const projectId = notes.projectId || notes.project_id;

      if (!projectId) {
        console.warn("No projectId found in webhook notes.");
        return res.json({ success: true, message: "Ignored: No project ID linked in notes." });
      }

      const project = await getProjectById(projectId);
      if (!project) {
        console.warn(`Project not found for webhook ID: ${projectId}`);
        return res.status(404).json({ success: false, error: "Project not found." });
      }

      const paymentId = paymentData?.id || orderData?.payment_id || "";
      const orderId = orderData?.id || paymentData?.order_id || "";
      const term = notes.term || "milestone";
      const planName = notes.planName || "Standard Package";

      // Idempotency: Check if already paid with this payment ID or order ID
      if (project.paymentStatus === "paid" && (project.paymentId === paymentId || project.orderId === orderId)) {
        console.log(`Idempotency: Webhook already processed for payment ${paymentId} / order ${orderId}.`);
        return res.json({ success: true, message: "Webhook already processed (Idempotency)." });
      }

      const portalAccessSource = project.portalAccessSource || "automatic";
      const shouldGrantAccess = portalAccessSource === "manual" ? project.portalAccess : true;

      // Update project status supporting dual-milestone states
      const isFinalMilestone = term === "final";
      const nextPaymentStatus = (term === "upfront" || isFinalMilestone) ? "paid" : "partially_paid";
      const planDetailString = isFinalMilestone ? `${planName} (fully paid milestone)` : `${planName} (${term || "milestone"})`;

      const updates = {
        paymentStatus: nextPaymentStatus,
        portalAccess: shouldGrantAccess,
        paymentProvider: "razorpay",
        paymentId: paymentId || project.paymentId,
        orderId: orderId || project.orderId,
        purchasedPlan: planDetailString,
        purchaseDate: new Date().toISOString(),
        portalAccessSource
      };

      const webhookId = req.reqId || "webhook-" + Date.now();
      await updateProject(projectId, updates, webhookId);
      console.log(`Successfully verified and updated project payment status from Webhook for ID: ${projectId}`);

      // Track event in Audit Trail
      await logAuditEvent({
        projectId: projectId,
        eventType: "Webhook Received",
        requestId: webhookId,
        actor: "System",
        status: "Success",
        notes: `Razorpay webhook received event: ${event.event}`
      });

      await logAuditEvent({
        projectId: projectId,
        eventType: "Payment Verified",
        requestId: webhookId,
        actor: "System",
        status: "Success",
        notes: `Webhook verified payment of plan: ${updates.purchasedPlan}. Ref: ${paymentId}`
      });

      if (shouldGrantAccess) {
        await logAuditEvent({
          projectId: projectId,
          eventType: "Portal Activated",
          requestId: webhookId,
          actor: "System",
          status: "Success",
          notes: "Portal access automatically granted upon webhook payment verification."
        });
      }

      // Send Receipt Email Notification
      const extra = await getExtraData(projectId);
      const devUrl = process.env.DEV_APP_URL || "http://localhost:3000";
      const portalUrl = `${devUrl}/login`;
      const formattedAmount = term === "upfront" ? "Rs. " + (extra?.quote?.price ? (extra.quote.price * 0.9).toFixed(0) : "13,499") : "Rs. " + (extra?.quote?.price ? (extra.quote.price * 0.5).toFixed(0) : "7,499");
      const emailHtml = getPaymentSuccessTemplate(
        project.clientName,
        project.businessName,
        updates.purchasedPlan,
        orderId,
        formattedAmount,
        portalUrl
      );
      sendEmailAsync(project.email, `Payment Confirmed - ${project.businessName}`, emailHtml);

      // Dispatch Internal Admin Alert
      triggerAdminNotification(
        "Payment Verified via Webhook",
        `Webhook verified successful payment transaction for project ${project.businessName}.`,
        {
          "Project ID": projectId,
          "Client Name": project.clientName,
          "Business Name": project.businessName,
          "Plan Purchased": updates.purchasedPlan,
          "Payment Ref": paymentId,
          "Order Ref": orderId,
          "Amount Verified": formattedAmount,
          "Webhook Event": event.event
        },
        webhookId
      );
    }

    return res.json({ success: true, message: "Webhook event processed." });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    return res.status(500).json({ success: false, error: err.message || "Webhook processing failed." });
  }
});

// API: Upload Assets to the Asset Center (Base64)
app.post("/api/projects/:id/upload", requestTimeout(25000, "Asset Upload"), validateProjectIdParam, requireAuth, verifyProjectOwnership, uploadRateLimiter, validateBody(uploadAssetSchema), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, type, size, content } = req.body;

    checkAbort(req);

    // Decode Content Buffer to validate size and bytes
    const buffer = Buffer.from(content, "base64");

    // Secure Upload Engine: Size checks
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ success: false, error: "File exceeds maximum allowed size of 5MB." });
    }

    // Secure Upload Engine: MIME type validation
    if (!MIME_WHITELIST.includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid content type. Allowed formats: PNG, JPEG, JPG, GIF, WEBP, SVG, PDF, TXT, DOC, DOCX." });
    }

    // Secure Upload Engine: Filename sanitization
    const sanitizedName = path.basename(name).replace(/[^a-zA-Z0-9.\-_]/g, "");
    if (!sanitizedName) {
      return res.status(400).json({ success: false, error: "Invalid file name." });
    }

    // Secure Upload Engine: Extension validation (Extension Spoofing Protection)
    const ext = path.extname(sanitizedName).toLowerCase();
    const allowedExtensionsMap: { [key: string]: string[] } = {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/jpg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    };

    const allowedExts = allowedExtensionsMap[type];
    if (!allowedExts || !allowedExts.includes(ext)) {
      return res.status(400).json({ success: false, error: "Mismatched file extension for content type." });
    }

    // Secure Upload Engine: Magic byte validation
    const magicValid = validateMagicBytes(buffer, type);
    if (!magicValid) {
      return res.status(400).json({ success: false, error: "File content signature verification (magic bytes) failed." });
    }

    checkAbort(req);

    const supabase = getSupabase();
    const bucketName = "codefuser-assets";
    const safeName = Date.now() + "_" + sanitizedName;
    const storagePath = `${id}/${safeName}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: type,
        upsert: true
      });

    if (uploadErr) {
      throw new Error(`Supabase Storage upload error: ${uploadErr.message}`);
    }

    const fileUrl = `storage://codefuser-assets/${storagePath}`;
    const extra = await addAssetFile(id, {
      name: sanitizedName,
      type,
      size: buffer.length,
      url: fileUrl
    });

    // Log "Deliverables Uploaded" to Audit Trail
    await logAuditEvent({
      projectId: id,
      eventType: "Deliverables Uploaded",
      requestId: req.reqId,
      actor: req.isAdmin ? "Admin" : "Client",
      status: "Success",
      notes: `Uploaded asset: ${sanitizedName} (${type}, ${buffer.length} bytes)`
    });

    // Dispatch Internal Admin Alert
    const uploadProject = await getProjectById(id);
    triggerAdminNotification(
      "Asset Uploaded",
      `A new asset file has been successfully uploaded for project ${uploadProject?.businessName || id}.`,
      {
        "Project ID": id,
        "Business Name": uploadProject?.businessName || "Unknown",
        "Uploaded By": req.isAdmin ? "Admin" : "Client",
        "File Name": sanitizedName,
        "File Type": type,
        "File Size": `${(buffer.length / 1024).toFixed(1)} KB`
      },
      req.reqId
    );

    if (res.headersSent || req.timedOut) return;

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Asset uploaded successfully and pinned to target project workspace." 
    });
  } catch (err: any) {
    if (res.headersSent) return;
    logger.error("Failed to upload asset", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process asset upload." });
  }
});

// API: Verify Admin Password
app.post("/api/admin/verify", adminRateLimiter, validateBody(adminVerifySchema), (req, res) => {
  try {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD;
    
    if (!actualPassword) {
      return res.status(500).json({ 
        success: false, 
        error: "System Configuration Error: The administrative access key is not configured in the host environment." 
      });
    }

    if (password && safeCompare(password, actualPassword)) {
      return res.json({ success: true, message: "Authentication successful." });
    } else {
      return res.status(401).json({ success: false, error: "Access Key is incorrect. Please contact system administrators." });
    }
  } catch (error: any) {
    console.error("Admin verification failed:", error);
    return res.status(500).json({ success: false, error: "Internal server error occurred." });
  }
});

// API: AI Recommendation Engine
app.post("/api/recommendation", requestTimeout(45000, "AI Recommendation"), validateBody(recommendationSchema), async (req: any, res) => {
  try {
    const formData = req.body;
    
    checkAbort(req);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic recommendation generator.");
      const fallbackRecommendations = getDeterministicRecommendation(formData);
      
      if (res.headersSent || req.timedOut) return;

      return res.json({ 
        recommendations: fallbackRecommendations,
        recommendation_source: "fallback"
      });
    }

    // Initialize the official Google Gen AI Client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are CodeFuser's expert IT and Business Growth Advisor.
Analyze the user's business diagnostics audit and generate personalized website package recommendations.
CodeFuser offers three precise and distinct tiered packages:
1. Ignite (id: "foundation", Price: "₹7,999", level: 1): Premium visual one-page identity hub. Best for micro-businesses, SaaS validate-tests, simple services, and direct local landing pages.
2. Fusion (id: "growth", Price: "₹14,999", level: 2): Full-scale multi-section business growth core. Best for local businesses desiring advanced lead forms, review showcases, interactive FAQs, and automated scheduler booking grids.
3. Catalyst (id: "dominance", Price: "₹34,999", level: 3): Immersive automated custom application. Ideal for complex digital agencies, CRM lead-pipelines, dynamic showcases, client accounts, or customized logic flows.

Analyze the user inputs:
- Company/Clinic Name: "${formData.businessName || 'Your Business'}"
- Rep/Owner Name: "${formData.ownerName || 'Representative'}"
- Intended Core Audience Profile: "${formData.targetAudience || 'General Audience'}"
- Primary Marketing/Sales Pain Point: "${formData.businessPainPoint || 'Low inquiries / Outdated look'}"
- Unique Market Edge: "${formData.uniqueAdvantage || 'Exceptional personal care'}"
- Choose Visual Tone Class: "${formData.brandTone || 'modern'}"
- Primary Tone Description: "${formData.brandColors || 'Amber & Carbon Grey'}"
- Requested scheduler: ${formData.needsBooking ? 'YES' : 'NO'}
- Requested reviews: ${formData.needsReviews ? 'YES' : 'NO'}
- Requested portfolio/gallery: ${formData.needsPortfolioGrid ? 'YES' : 'NO'}
- Requested custom products/pricing: ${formData.needsProducts ? 'YES' : 'NO'}

Generate exactly 3 recommendation structures:
- One and only one entry must have visual tag: "⭐ Best Match For Your Business" - select whichever of the three tiers (foundation, growth, or dominance) fits their requirements most logically and strategically.
- One and only one entry must have tag: "💰 Best Value" - map this to either "foundation" (Ignite) or "growth" (Fusion) as the most cost-effective path to resolve their pain point.
- One and only one entry must have tag: "📈 Built For Growth" - map this to either "growth" (Fusion) or "dominance" (Catalyst) as the path that equips them with future-proof capabilities like booking widgets, integrations, or databases.

Provide exactly 3 to 4 customized, strategic, friendly, human-written bullet points for each recommendation explaining HOW that specific package directly answers their listed audience profile, addresses their specific primary pain point, and incorporates their chosen design vibes.
Ensure absolutely ZERO developer-jargon, confidence scores, technical metrics, AI logs, or prompts are returned. Keep response completely polished and client-ready.`;

    let response: any = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.5-flash"];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        checkAbort(req);
        console.log(`Attempting recommendation generation with model: ${modelName}`);
        response = await withRetry(async () => {
          return await ai.models.generateContent({
            model: modelName,
            contents: "Generate the customized package blueprints based on the parameters.",
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendations: {
                    type: Type.ARRAY,
                    description: "Must contain exactly 3 recommendation cards mapping to 'foundation', 'growth', and 'dominance' plan IDs.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        planId: { 
                          type: Type.STRING, 
                          description: "Must be exactly 'foundation', 'growth', or 'dominance'" 
                        },
                        planName: { 
                          type: Type.STRING, 
                          description: "Must be 'Ignite', 'Fusion', or 'Catalyst'" 
                        },
                        tag: { 
                          type: Type.STRING, 
                          description: "Must be exactly '⭐ Best Match For Your Business', '💰 Best Value', or '📈 Built For Growth'" 
                        },
                        tagline: { 
                          type: Type.STRING, 
                          description: "A business-focused tagline explaining why this plan maps to their state" 
                        },
                        price: { 
                          type: Type.STRING, 
                          description: "List the correct price: ₹7,999 for foundation, ₹14,999 for growth, and ₹34,999 for dominance" 
                        },
                        bullets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "3 to 4 concrete bullet points specifically matching their company goals, audience, and bottleneck solution"
                        }
                      },
                      required: ["planId", "planName", "tag", "tagline", "price", "bullets"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          });
        }, {
          reqId: req.reqId || "N/A",
          operationName: `Gemini generateContent (${modelName})`,
          isIdempotent: true
        });

        checkAbort(req);

        if (response && response.text) {
          const recommendationData = JSON.parse(response.text);
          if (recommendationData.recommendations && recommendationData.recommendations.length > 0) {
            console.log(`Successfully generated recommendations using model: ${modelName}`);
            
            if (res.headersSent || req.timedOut) return;

            return res.json({
              ...recommendationData,
              recommendation_source: "ai"
            });
          }
        }
      } catch (err: any) {
        if (req.timedOut || req.clientDisconnected) {
          throw err; // Stop trying models if we actually timed out or disconnected
        }
        console.warn(`Model ${modelName} call failed or was overloaded:`, err.message || err);
        lastError = err;
        // Proceed to next model in loop
      }
    }

    if (lastError) {
      throw lastError;
    } else {
      throw new Error("All reservation models returned empty responses.");
    }

  } catch (error) {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    console.error("Gemini AI Recommendation Pipeline failed:", error);
    const fallbackRecommendations = getDeterministicRecommendation(req.body);
    return res.json({ 
      recommendations: fallbackRecommendations,
      recommendation_source: "fallback"
    });
  }
});

// API: Start Project Package Upgrade Options (Strategic Pricing Consultant Engine)
app.post("/api/start-project/package-upgrade-options", requestTimeout(45000, "AI Upgrade Options"), validateBody(packageUpgradeSchema), async (req: any, res) => {
  try {
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    
    checkAbort(req);

    const cleanBusinessName = String(businessName || "").trim().toLowerCase();
    const cleanPrompt = String(aiPrompt || "").trim().toLowerCase();
    const cleanIndustry = String(industry || "").trim().toLowerCase();
    const cleanGoal = String(goal || "").trim().toLowerCase();
    const recCacheKey = `recommendations:${String(packageId)}:${cleanBusinessName}:${cleanIndustry}:${cleanGoal}:${cleanPrompt}`;

    const cachedRec = await cache.get(recCacheKey);
    if (cachedRec) {
      logger.info(`[PERF] Recommendations cache hit! Key: ${recCacheKey}`);
      if (res.headersSent || req.timedOut) return;
      return res.json(JSON.parse(cachedRec));
    }

    // Choose base and upgrade 1 prices and names realistically
    let baseName = "✦ Fusion";
    let basePrice = "₹14,999";
    let baseFeatures = [
      "Makes your business feel more premium and professional",
      "Designed to give your customers a better experience",
      "Personalized recommendations for your business",
      "Extra attention to your business"
    ];

    let upgrade1Name = "✦ Fusion+";
    let upgrade1Price = "₹16,999";
    let upgrade1FeaturesAdded = [
      "Built to help your business grow online",
      "Smarter recommendations based on your industry",
      "Better overall customer experience",
      "More premium finishing touches",
      "Recommended specifically for your business"
    ];

    if (packageId === "foundation") {
      baseName = "⚡ Ignite";
      basePrice = "₹7,999";
      baseFeatures = [
        "Premium launch experience",
        "Better overall customer experience",
        "Extra attention to your business needs",
        "Designed to make your brand stand out"
      ];
      upgrade1Name = "⚡ Ignite+";
      upgrade1Price = "₹9,999";
      upgrade1FeaturesAdded = [
        "More premium website experience",
        "Better customer experience",
        "Extra attention to your business needs",
        "Personalized recommendations for your business",
        "Recommended by our AI business analysis"
      ];
    } else if (packageId === "dominance") {
      baseName = "⬢ Catalyst";
      basePrice = "₹34,999";
      baseFeatures = [
        "Our most premium experience",
        "Extra care throughout your project",
        "Personalized business recommendations",
        "Designed for businesses that want the very best experience"
      ];
      upgrade1Name = "⬢ Catalyst+";
      upgrade1Price = "₹36,999";
      upgrade1FeaturesAdded = [
        "Our most premium experience",
        "Extra care throughout your project",
        "Personalized business recommendations",
        "Priority treatment from start to launch",
        "Designed for businesses that want the very best experience"
      ];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic upgrade recommendations.");
      
      if (res.headersSent || req.timedOut) return;

      const fallbackResult = {
        summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
        options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
      };
      await cache.set(recCacheKey, JSON.stringify(fallbackResult), 300);
      return res.json(fallbackResult);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are a friendly premium business advisor at CodeFuser.
Your task is to generate both:
1. A diagnostic AI Executive Summary of the client's business ("${businessName}", Industry: "${industry || 'General'}", Goal: "${goal || 'Growth'}").
2. TWO customized, progressive package recommendation cards (the baseline card, and one tailored upgrade card).

The customer has selected the package: ${baseName} (${basePrice}).
Your goal is to make them feel understood, comfortable, confident, and personally advised.

The AI should NOT sound like an AI, technical consultant, or salesperson.
You must speak in extremely simple, warm, human English that any small business owner can immediately understand in a few seconds.

Strict Tone and Jargon Rules (CRITICAL):
- NEVER use technical jargon, corporate buzzwords, developer terminology, or fancy marketing language.
- DO NOT USE terms such as:
  * SEO Optimization / SEO / Search visibility / Analytics / Launch platform / Digital hub / Enterprise capability / Autonomy / Workflows / Integrations / APIs / CRMs / Databases / Portals
- SELL FEELINGS AND HUMAN OUTCOMES: Focus purely on:
  * Premium design / Look
  * Better overall customer experience
  * Extra attention to their business
  * Personalized recommendations
  * More confidence in their brand launch
  * A tailored business launch experience

Specific recommendationReason Rules:
Explain the recommendation based on the customer's business type. Follow these examples exactly in tone, simplicity, and style:
- If the business is a Clinic/Medical/Dental: "People trust businesses that look professional online. We recommend ${upgrade1Name} to give your clinic a more premium and trustworthy experience."
- If the business is a Restaurant/Cafe: "Your customers usually decide quickly where to eat. ${upgrade1Name} helps us make your restaurant look more welcoming and professional."
- If the business is a Gym/Fitness/Yoga: "People love joining brands they can trust. ${upgrade1Name} gives us a little more room to make your gym stand out."
- If the business is a Salon/Spa/Beauty/Hair: "First impressions matter a lot for beauty businesses. ${upgrade1Name} helps us make your salon look more attractive and premium."
- Otherwise, speak naturally and personally about their business category: "We looked at your business and this is what we would personally recommend for you. ${upgrade1Name} helps us make your business look more professional and welcoming."

The recommendation reason must be short, easy to read, and feel like: "We looked at your business and this is what we would personally recommend for you."

Strict Rules for Card Generation:
1. Card 1 must match the SELECTED package "${baseName}" at exactly "${basePrice}". It must include:
   - "headline": Short, simple, friendly outcome of why it is a great start (e.g., "A clean, beautiful start designed to make your brand stand out.").
   - "benefits": A list of 3-4 items. Use simple words like "✓ Premium launch experience", "✓ Extra attention to your business", "✓ Designed to make your brand stand out". Each item must start with "✓ ".
   - "rationale": Simple explanation of why it fits their starting budget (e.g., "This package matches your starting budget perfectly and gives us everything we need to build a beautiful website.").

2. Card 2 ("⭐ Recommended Upgrade") must be "${upgrade1Name}" at exactly "${upgrade1Price}". It must focus ONLY on premium outcomes, better customer feelings, and more customized care. Include benefits styled after these exact templates:
   - For Ignite+ ("${upgrade1Price}"):
     * "✓ More premium website experience"
     * "✓ Better overall customer experience"
     * "✓ Extra attention to your business needs"
     * "✓ Personalized recommendations for your business"
     * "✓ Recommended by our AI business analysis"
   - For Fusion+ ("${upgrade1Price}"):
     * "✓ Built to help your business grow online"
     * "✓ Smarter recommendations based on your industry"
     * "✓ Better overall customer experience"
     * "✓ More premium finishing touches"
     * "✓ Recommended specifically for your business"
   - For Catalyst+ ("${upgrade1Price}"):
     * "✓ Our most premium experience"
     * "✓ Extra care throughout your project"
     * "✓ Personalized business recommendations"
     * "✓ Priority treatment from start to launch"
     * "✓ Designed for businesses that want the very best experience"
   Do NOT repeat Card 1 benefits. Each item must start with "✓ ".
   - "rationale": Short, personal explanation of why this upgrade helps their brand (e.g., "A little extra care makes a big difference. This allows us to give your customers an even better, more tailored experience.").

Important:
- Keep the language simple enough for any small business owner to understand in a few seconds.
- The progression must stay psychologically close to their chosen budget.
- The outcome list should be tailored specifically to ${businessName} operating in the ${industry || 'general'} space.
- Do not repeat elements between cards.`;

    checkAbort(req);

    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate the two strategic package cards and AI diagnostic summary as requested.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  businessCategory: { type: Type.STRING },
                  specificBusinessType: { type: Type.STRING },
                  primaryBusinessGoal: { type: Type.STRING },
                  customerVision: { type: Type.STRING },
                  biggestOpportunity: { type: Type.STRING },
                  recommendedStartingPackage: { type: Type.STRING },
                  recommendationReason: { type: Type.STRING }
                },
                required: [
                  "businessCategory",
                  "specificBusinessType",
                  "primaryBusinessGoal",
                  "customerVision",
                  "biggestOpportunity",
                  "recommendedStartingPackage",
                  "recommendationReason"
                ]
              },
              options: {
                type: Type.ARRAY,
                description: "Must contain exactly 2 strategic card options: Card 1 and Card 2",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Must be 'current' or 'upgrade_1'" },
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    benefits: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Outcome bullet points starting with a checkmark or clear action phrase"
                    },
                    rationale: { type: Type.STRING }
                  },
                  required: ["id", "name", "price", "headline", "benefits", "rationale"]
                }
              }
            },
            required: ["options", "summary"]
          }
        }
      });
    }, {
      reqId: req.reqId || "N/A",
      operationName: "Gemini generateContent (gemini-3.5-flash)",
      isIdempotent: true
    });

    checkAbort(req);

    if (response && response.text) {
      const data = JSON.parse(response.text);
      if (data.options && data.options.length === 2 && data.summary) {
        
        if (res.headersSent || req.timedOut) return;

        await cache.set(recCacheKey, JSON.stringify(data), 300);
        return res.json(data);
      }
    }
    
    throw new Error("Invalid response format from content generation");

  } catch (err: any) {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    console.error("Failed to generate package upgrade recommendations:", err);
    // Fallback response:
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    
    const cleanBusinessName = String(businessName || "").trim().toLowerCase();
    const cleanPrompt = String(aiPrompt || "").trim().toLowerCase();
    const cleanIndustry = String(industry || "").trim().toLowerCase();
    const cleanGoal = String(goal || "").trim().toLowerCase();
    const recCacheKey = `recommendations:${String(packageId)}:${cleanBusinessName}:${cleanIndustry}:${cleanGoal}:${cleanPrompt}`;

    const fallbackResult = {
      summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
      options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
    };
    await cache.set(recCacheKey, JSON.stringify(fallbackResult), 300);
    return res.json(fallbackResult);
  }
});

function getFallbackSummary(
  packageId: string,
  businessName: string,
  industry: string,
  goal: string,
  aiPrompt: string
) {
  let recommendedPkg = "✦ Fusion+";
  if (packageId === "foundation") {
    recommendedPkg = "⚡ Ignite+";
  } else if (packageId === "dominance") {
    recommendedPkg = "⬢ Catalyst+";
  }

  const normalized = (industry || "").toLowerCase();
  
  let specificType = "Professional Business";
  let opportunity = "Making your business look more welcoming and professional online.";
  let businessCat = "General Business";
  let recommendationReason = "";

  if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("cafe")) {
    specificType = "Restaurant / Cafe";
    opportunity = "Making your restaurant feel warm, welcoming, and premium to customers.";
    businessCat = "Food & Beverage";
    recommendationReason = `Your customers usually decide quickly where to eat. ${recommendedPkg} helps us make your restaurant look more welcoming and professional.`;
  } else if (normalized.includes("medical") || normalized.includes("clinic") || normalized.includes("dental") || normalized.includes("doctor")) {
    specificType = "Professional Clinic";
    opportunity = "Helping clients feel comfortable and trust you with their care.";
    businessCat = "Health & Wellness";
    recommendationReason = `People trust businesses that look professional online. We recommend ${recommendedPkg} to give your clinic a more premium and trustworthy experience.`;
  } else if (normalized.includes("gym") || normalized.includes("fitness") || normalized.includes("trainer") || normalized.includes("yoga")) {
    specificType = "Fitness Center / Gym";
    opportunity = "Making your brand look trustworthy and motivating to new members.";
    businessCat = "Sports & Fitness";
    recommendationReason = `People love joining brands they can trust. ${recommendedPkg} gives us a little more room to make your gym stand out.`;
  } else if (normalized.includes("salon") || normalized.includes("spa") || normalized.includes("beauty") || normalized.includes("hair")) {
    specificType = "Beauty Salon / Spa";
    opportunity = "Making a great first impression with a premium look.";
    businessCat = "Beauty & Personal Care";
    recommendationReason = `First impressions matter a lot for beauty businesses. ${recommendedPkg} helps us make your salon look more attractive and premium.`;
  } else if (normalized.includes("tyre") || normalized.includes("tire") || normalized.includes("car") || normalized.includes("automotive") || normalized.includes("garage") || normalized.includes("mechanic")) {
    specificType = "Specialized Service Shop";
    opportunity = "Helping customers easily find you when they need help.";
    businessCat = "Automotive Services";
    recommendationReason = `When people have car trouble, they want someone they can trust. We recommend ${recommendedPkg} to show your clients they are in expert hands.`;
  } else if (normalized.includes("estate") || normalized.includes("real") || normalized.includes("property")) {
    specificType = "Real Estate Office";
    opportunity = "Helping clients feel confident when reaching out to buy or rent.";
    businessCat = "Real Estate";
    recommendationReason = `Buying or renting a home is a huge decision. We recommend ${recommendedPkg} to build deep trust with potential clients.`;
  } else {
    recommendationReason = `We looked at your business and this is what we would personally recommend for you. ${recommendedPkg} helps us make your business look more professional and welcoming.`;
  }

  let goalLabel = "Helping your brand look more professional and trustworthy.";

  return {
    businessCategory: businessCat,
    specificBusinessType: specificType,
    primaryBusinessGoal: goalLabel,
    customerVision: aiPrompt || "Create a premium, modern design customized for your business.",
    biggestOpportunity: opportunity,
    recommendedStartingPackage: recommendedPkg,
    recommendationReason: recommendationReason
  };
}

function getFallbackUpgrades(
  packageId: string,
  businessName: string = "Your Business",
  ownerName: string = "",
  industry: string = "",
  goal: string = ""
) {
  const bName = businessName || "Your Business";
  
  if (packageId === "foundation") {
    return [
      {
        id: "current",
        name: "⚡ Ignite",
        price: "₹7,999",
        headline: "High-impact digital hub designed to make your brand stand out.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "This package maps perfectly to your starting budget and secures all operational foundations with extreme attention to detail."
      },
      {
        id: "upgrade_1",
        name: "⚡ Ignite+",
        price: "₹9,999",
        headline: "Maximize first impressions and increase customer confidence.",
        benefits: [
          "✓ More premium website experience",
          "✓ Better overall customer experience",
          "✓ Extra attention to your business needs",
          "✓ Personalized recommendations for your business",
          "✓ Recommended by our AI business analysis"
        ],
        rationale: "Investing just a little more allows you to showcase a highly tailored business experience, making it significantly easier to establish immediate trust with visitors."
      }
    ];
  }

  if (packageId === "dominance") {
    return [
      {
        id: "current",
        name: "⬢ Catalyst",
        price: "₹34,999",
        headline: "Our most premium experience delivering ultimate confidence and strategy alignment.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "Our elite tier delivers bespoke aesthetic craftsmanship and high-touch project support optimized for high-ticket acquisition."
      },
      {
        id: "upgrade_1",
        name: "⬢ Catalyst+",
        price: "₹36,999",
        headline: "Our absolute highest-touch experience with personalized guidance.",
        benefits: [
          "✓ Our most premium experience",
          "✓ Extra care throughout your project",
          "✓ Personalized business recommendations",
          "✓ Priority treatment from start to launch",
          "✓ Designed for businesses that want the very best experience"
        ],
        rationale: "By making a modest incremental investment, your business receives ultimate brand strategy guidance and our highest tier of sustained personal attention."
      }
    ];
  }

  // Default / "growth" / Fusion
  return [
    {
      id: "current",
      name: "✦ Fusion",
      price: "₹14,999",
      headline: "Scalable platform designed to make your business feel more premium and professional.",
      benefits: getDynamicIndustryBenefits(industry, 'base'),
      rationale: "Our most popular core plan equips you with custom visual delight and deep personal strategy alignment to build immediate online authority."
    },
    {
      id: "upgrade_1",
      name: "✦ Fusion+",
      price: "₹16,999",
      headline: "Accelerate user trust and elevate your brand's overall experience.",
      benefits: [
        "✓ Built to help your business grow online",
        "✓ Smarter recommendations based on your industry",
        "✓ Better overall customer experience",
        "✓ More premium finishing touches",
        "✓ Recommended specifically for your business"
      ],
      rationale: "A modest improvement lets you leverage personalized customer pathways and premium finishing touches, translating directly into a much better overall client journey."
    }
  ];
}

function getDynamicIndustryBenefits(industry: string, level: 'base' | 'upgrade_1'): string[] {
  const ind = (industry || "").toLowerCase();
  
  if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe")) {
    if (level === 'base') {
      return [
        "✓ Create an immediate premium feeling to elevate your brand profile.",
        "✓ Personalized recommendations for your dining setup.",
        "✓ Designed to give your customers a better experience."
      ];
    } else {
      return [
        "✓ Designed for businesses that want the very best experience.",
        "✓ Makes your business feel more premium and professional."
      ];
    }
  }

  if (ind.includes("medical") || ind.includes("clinic") || ind.includes("dental") || ind.includes("doctor") || ind.includes("wellness")) {
    if (level === 'base') {
      return [
        "✓ Designed to make your brand stand out.",
        "✓ Better overall customer experience.",
        "✓ Extra attention to your business needs."
      ];
    } else {
      return [
        "✓ A more tailored business launch experience.",
        "✓ More confidence in your brand launch."
      ];
    }
  }

  if (ind.includes("tyre") || ind.includes("tire") || ind.includes("car") || ind.includes("automotive") || ind.includes("garage") || ind.includes("mechanic")) {
    if (level === 'base') {
      return [
        "✓ Extra attention to your business needs.",
        "✓ Personalized recommendations for your brand.",
        "✓ A premium, professional display for your services."
      ];
    } else {
      return [
        "✓ Extra care throughout your project.",
        "✓ Priority treatment from start to launch."
      ];
    }
  }

  if (ind.includes("estate") || ind.includes("real") || ind.includes("property") || ind.includes("prop") || ind.includes("agent") || ind.includes("agency")) {
    if (level === 'base') {
      return [
        "✓ Makes your business feel more premium and professional.",
        "✓ Designed to give your customers a better experience.",
        "✓ Personalized recommendations for your business."
      ];
    } else {
      return [
        "✓ Extra care throughout your project.",
        "✓ A more tailored business launch experience."
      ];
    }
  }

  // DEFAULT / GENERAL SERVICES & RETAIL
  if (level === 'base') {
    return [
      "✓ Premium launch experience.",
      "✓ Personalized recommendations.",
      "✓ Extra attention to your business."
    ];
  } else {
    return [
      "✓ Better overall customer experience.",
      "✓ More confidence in your purchase."
    ];
  }
}


// Resolute dynamic fallback rule so the user is never blocked or shown an error
function getDeterministicRecommendation(formData: any) {
  const businessName = formData.businessName || 'Your Business';
  const painPoint = formData.businessPainPoint || 'lack of online inquiries';
  const targetAudience = formData.targetAudience || 'local prospective clients';
  
  const needsBooking = !!formData.needsBooking;
  const needsFeatures = !!(formData.needsReviews || formData.needsProducts || formData.needsPortfolioGrid);

  let bestMatchId = 'growth';
  let bestMatchName = '✦ Fusion';
  let bestMatchPrice = '₹14,999';
  let bestMatchTagline = `Engineered to capture and schedule ${targetAudience} effortlessly.`;
  
  if (needsBooking) {
    bestMatchId = 'growth';
    bestMatchName = '✦ Fusion';
    bestMatchPrice = '₹14,999';
    bestMatchTagline = 'Automates live booking channels to immediately bypass your scheduling roadblocks.';
  } else if (!needsBooking && !needsFeatures) {
    bestMatchId = 'foundation';
    bestMatchName = '⚡ Ignite';
    bestMatchPrice = '₹7,999';
    bestMatchTagline = 'High-velocity showcase to validate your visual identity with minimal latency.';
  } else {
    bestMatchId = 'dominance';
    bestMatchName = '⬢ Catalyst';
    bestMatchPrice = '₹34,999';
    bestMatchTagline = 'Maximal digital expansion featuring automated capture workflows and review synchronization.';
  }

  return [
    {
      planId: bestMatchId,
      planName: bestMatchName,
      tag: "⭐ Best Match For Your Business",
      tagline: bestMatchTagline,
      price: bestMatchPrice,
      bullets: [
        `Specially optimized to override: "${painPoint}" by implementing modern high-efficiency layout patterns.`,
        `Positions your unique advantage to build strong visual authority among ${targetAudience}.`,
        "Pre-configures required integrations (calendars/forms) directly into a gorgeous, smooth client funnel."
      ]
    },
    {
      planId: "foundation",
      planName: "⚡ Ignite",
      tag: "💰 Best Value",
      tagline: "Unlocks high-impact conversion metrics with lightweight overhead.",
      price: "₹7,999",
      bullets: [
        "Provides an elegant single-page presentation optimized specifically for mobile responsiveness.",
        "Perfect entry point for capturing new digital leads without secondary maintenance overhead.",
        "Equipped with instant contact hooks including WhatsApp click-to-connect."
      ]
    },
    {
      planId: "dominance",
      planName: "⬢ Catalyst",
      tag: "📈 Built For Growth",
      tagline: "Total digital empowerment utilizing advanced visual layouts and automated captures.",
      price: "₹34,999",
      bullets: [
        "Integrates continuous automation channels like AI assistants, review feeds, and CRM triggers.",
        "Designed explicitly to support infinite expansion as you scale your brand presence.",
        "Includes absolute layout flexibility and prioritized diagnostic support cycles."
      ]
    }
  ];
}

// Global Error Handling Middleware (must be registered after all route handlers)
app.use((err: any, req: any, res: any, next: any) => {
  const reqId = req.reqId || "N/A";
  const statusCode = err.status || err.statusCode || 500;
  
  logger.error(`Unhandled error during request processing: ${err.message || err}`, err, {
    reqId,
    method: req.method,
    url: req.url,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "An internal server error occurred." 
      : err.message || "Internal Server Error",
    reqId,
  });
});

// Process-level exception and rejection handlers
process.on("uncaughtException", (error) => {
  logger.error("SYSTEM CRITICAL: Uncaught Exception detected", error);
  // Graceful shutdown delay to allow logs to flush
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (reason: any) => {
  logger.error("SYSTEM CRITICAL: Unhandled Promise Rejection detected", reason instanceof Error ? reason : new Error(String(reason)));
});

// Server bootstrap with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    initializeAutomationScheduler();
  });
}

if (!process.env.VERCEL && !process.env.TESTING) {
  startServer();
}

export default app;
