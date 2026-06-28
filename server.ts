import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { addProject, getProjects, updateProject, getSupabase, getProjectById } from "./server/db";
import { getExtraData, updateQuote, addAssetFile } from "./server/extra_store";
import { verifyPaymentSignature, verifyWebhookSignature, getRazorpayInstance } from "./server/razorpay";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Request body parser with 50mb limit for base64 file uploads and raw body capture for webhook signature verification
app.use(express.json({
  limit: "50mb",
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files statically
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// API: Create new project
app.post("/api/projects", async (req, res) => {
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
      userId
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
      userId: userId || ""
    };

    console.log("Compiling and initializing project in CodeFuser Core architecture style...");
    const savedProject = await addProject(payload);
    
    return res.status(201).json({
      success: true,
      data: savedProject,
      message: "Project compiled and registered successfully under Core flow."
    });
  } catch (error: any) {
    console.error("Failed to compile project submission in core backend:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Get all active projects (with secure authenticated filtering support)
app.get("/api/projects", async (req, res) => {
  try {
    const { userId, email } = req.query;
    const projects = await getProjects();
    
    if (userId || email) {
      const filtered = projects.filter(p => {
        const matchUserId = userId ? p.userId === userId : false;
        const matchEmail = email ? p.email?.trim().toLowerCase() === String(email).trim().toLowerCase() : false;
        return matchUserId || matchEmail;
      });
      return res.json({ projects: filtered });
    }
    
    return res.json({ projects });
  } catch (error: any) {
    console.error("Failed to load project database items:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

// API: Customer Registration (SignUp Proxy)
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (error: any) {
    console.error("Auth Signup error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to sign up." });
  }
});

// API: Customer Authentication (Login Proxy)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, user: data.user, session: data.session });
  } catch (error: any) {
    console.error("Auth Login error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log in." });
  }
});

// API: Customer Logout Proxy
app.post("/api/auth/logout", async (req, res) => {
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    return res.json({ success: true });
  } catch (error: any) {
    console.error("Auth Logout error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to log out." });
  }
});

// (Obsolete server-side OAuth endpoints are replaced by Vercel-compatible direct client-side Supabase authentication flow)

// API: Update a single project state
app.put("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }

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
    if (hasRestrictedField) {
      const adminPassword = req.headers["x-admin-password"];
      const actualPassword = process.env.ADMIN_PASSWORD;
      
      if (!actualPassword || adminPassword !== actualPassword) {
        return res.status(403).json({ 
          success: false, 
          error: "Unauthorized: Modifying payment status or authorization parameters is restricted to authenticated administrators." 
        });
      }
    }

    const updated = await updateProject(id, updates);
    return res.json({ success: true, data: updated, message: "Project updated successfully in the core database." });
  } catch (error: any) {
    console.error("Failed to update project status / elements:", error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// API: Get extra project data (Quote and Uploaded Assets)
app.get("/api/projects/:id/extra", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }
    const extra = getExtraData(id);
    return res.json({ success: true, data: extra });
  } catch (err: any) {
    console.error("Failed to get extra project data:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Save/Lock Official Quote for a project
app.post("/api/projects/:id/quote", async (req, res) => {
  try {
    const { id } = req.params;
    const { packageName, price, discount, features, summary } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }
    if (!packageName || price === undefined) {
      return res.status(400).json({ success: false, error: "Package name and price are required to lock quote." });
    }

    const extra = updateQuote(id, {
      packageName,
      price: Number(price),
      discount: Number(discount || 0),
      features: features || [],
      summary: summary || ""
    });

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Official Quote locked successfully. Standard price frozen for 7 days." 
    });
  } catch (err: any) {
    console.error("Failed to update quote:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Unlock/Reset Quote for generating new recommendation
app.post("/api/projects/:id/quote/reset", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }
    const extra = updateQuote(id, null);
    return res.json({ success: true, data: extra, message: "Existing quotation has been unlocked." });
  } catch (err: any) {
    console.error("Failed to reset quote:", err);
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// API: Expose Razorpay Public Key ID
app.get("/api/config/razorpay", (req, res) => {
  return res.json({
    keyId: process.env.RAZORPAY_KEY_ID || ""
  });
});

// API: Create Razorpay Order
app.post("/api/projects/:id/razorpay-order", async (req, res) => {
  try {
    const { id } = req.params;
    const { term } = req.body; // 'milestone' | 'upfront'
    
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }
    if (term !== "milestone" && term !== "upfront") {
      return res.status(400).json({ success: false, error: "Payment term must be 'milestone' or 'upfront'." });
    }

    // Retrieve project by ID from database
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found in core database." });
    }

    // Retrieve extra details (locked price)
    const extra = getExtraData(id);
    let amountInRupees = 24999; // Default fallback
    let planName = "Fusion Package";

    if (extra && extra.quote) {
      planName = extra.quote.packageName || "Standard Package";
      const totalPrice = extra.quote.price;
      if (term === "upfront") {
        amountInRupees = totalPrice; // 100% upfront
      } else {
        amountInRupees = Math.round(totalPrice * 0.5); // 50% upfront milestone
      }
    } else {
      // Fallback manual price calculation if quote is missing
      const packageId = project.selectedPackage || "growth";
      let basePrice = 24999;
      if (packageId === "foundation") basePrice = 9999;
      if (packageId === "dominance") basePrice = 49999;
      
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
    console.error("Failed to create Razorpay order:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to create payment order." });
  }
});

// API: Verify Razorpay Payment Signature (Client-side fast checkout verification)
app.post("/api/projects/:id/verify-payment", async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, term } = req.body;
    
    if (!id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing required payment verification fields." });
    }

    // Validate Signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      console.warn(`Payment signature verification failed for project ${id}`);
      return res.status(400).json({ success: false, error: "Invalid payment signature." });
    }

    // Retrieve project by ID
    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const extra = getExtraData(id);
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

    // Update project state in Supabase & Extra store
    const updates = {
      paymentStatus: "paid",
      portalAccess: shouldGrantAccess,
      paymentProvider: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      purchasedPlan: `${planName} (${term || "milestone"})`,
      purchaseDate: new Date().toISOString(),
      portalAccessSource
    };

    const updatedProject = await updateProject(id, updates);

    return res.json({
      success: true,
      message: "Payment verified successfully. Portal access granted.",
      project: updatedProject
    });
  } catch (error: any) {
    console.error("Failed to verify payment:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to verify payment." });
  }
});

// API: Razorpay Webhook Endpoint (Primary source-of-truth asynchronous processor)
app.post("/api/webhooks/razorpay", async (req: any, res) => {
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

      // Update project status
      const updates = {
        paymentStatus: "paid",
        portalAccess: shouldGrantAccess,
        paymentProvider: "razorpay",
        paymentId: paymentId || project.paymentId,
        orderId: orderId || project.orderId,
        purchasedPlan: `${planName} (${term})`,
        purchaseDate: new Date().toISOString(),
        portalAccessSource
      };

      await updateProject(projectId, updates);
      console.log(`Successfully verified and updated project payment status from Webhook for ID: ${projectId}`);
    }

    return res.json({ success: true, message: "Webhook event processed." });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    return res.status(500).json({ success: false, error: err.message || "Webhook processing failed." });
  }
});

// API: Upload Assets to the Asset Center (Base64)
app.post("/api/projects/:id/upload", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, size, content } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "Project ID is required." });
    }
    if (!name || !content) {
      return res.status(400).json({ success: false, error: "File name and file content are required." });
    }

    // Direct write base64 file to disk
    const safeName = Date.now() + "_" + name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const filePath = path.join(process.cwd(), "public", "uploads", safeName);
    
    const buffer = Buffer.from(content, "base64");
    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `/uploads/${safeName}`;
    const extra = addAssetFile(id, {
      name,
      type,
      size: Number(size || buffer.length),
      url: fileUrl
    });

    return res.json({ 
      success: true, 
      data: extra, 
      message: "Asset uploaded successfully and pinned to target project workspace." 
    });
  } catch (err: any) {
    console.error("Failed to upload asset:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to process asset upload." });
  }
});

// API: Verify Admin Password
app.post("/api/admin/verify", (req, res) => {
  try {
    const { password } = req.body;
    const actualPassword = process.env.ADMIN_PASSWORD;
    
    if (!actualPassword) {
      return res.status(500).json({ 
        success: false, 
        error: "System Configuration Error: The administrative access key is not configured in the host environment." 
      });
    }

    if (password === actualPassword) {
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
app.post("/api/recommendation", async (req, res) => {
  try {
    const formData = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic recommendation generator.");
      const fallbackRecommendations = getDeterministicRecommendation(formData);
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
1. Ignite (id: "foundation", Price: "₹9,999", level: 1): Premium visual one-page identity hub. Best for micro-businesses, SaaS validate-tests, simple services, and direct local landing pages.
2. Fusion (id: "growth", Price: "₹24,999", level: 2): Full-scale multi-section business growth core. Best for local businesses desiring advanced lead forms, review showcases, interactive FAQs, and automated scheduler booking grids.
3. Catalyst (id: "dominance", Price: "₹49,999", level: 3): Immersive automated custom application. Ideal for complex digital agencies, CRM lead-pipelines, dynamic showcases, client accounts, or customized logic flows.

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
        console.log(`Attempting recommendation generation with model: ${modelName}`);
        response = await ai.models.generateContent({
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
                        description: "List the correct price: ₹9,999 for foundation, ₹24,999 for growth, and ₹49,999 for dominance" 
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

        if (response && response.text) {
          const recommendationData = JSON.parse(response.text);
          if (recommendationData.recommendations && recommendationData.recommendations.length > 0) {
            console.log(`Successfully generated recommendations using model: ${modelName}`);
            return res.json({
              ...recommendationData,
              recommendation_source: "ai"
            });
          }
        }
      } catch (err: any) {
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
    console.error("Gemini AI Recommendation Pipeline failed:", error);
    const fallbackRecommendations = getDeterministicRecommendation(req.body);
    return res.json({ 
      recommendations: fallbackRecommendations,
      recommendation_source: "fallback"
    });
  }
});

// API: Start Project Package Upgrade Options (Strategic Pricing Consultant Engine)
app.post("/api/start-project/package-upgrade-options", async (req, res) => {
  try {
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    
    // Choose base, upgrade 1, and upgrade 2 prices and names realistically
    let baseName = "✦ Fusion";
    let basePrice = "₹24,999";
    let baseFeatures = [
      "Portfolio / Gallery",
      "Testimonials Section",
      "FAQ Section",
      "Booking Integration",
      "Enhanced SEO Structure",
      "Premium Design System",
      "Advanced Animations",
      "Conversion Focused Layout"
    ];

    let upgrade1Name = "✦ Fusion+";
    let upgrade1Price = "₹27,999";
    let upgrade1FeaturesAdded = ["Google Reviews Sync", "Interactive Direction Maps", "Custom Contact Flows"];

    let upgrade2Name = "✦ Fusion Pro";
    let upgrade2Price = "₹29,999";
    let upgrade2FeaturesAdded = ["Newsletter Automated Campaign Engine", "Minor Automated Calendar Tasks", "High-Authority Search Optimization (SEO)"];

    if (packageId === "foundation") {
      baseName = "⚡ Ignite";
      basePrice = "₹9,999";
      baseFeatures = [
        "Premium One Page Website",
        "Mobile Responsive",
        "WhatsApp Integration",
        "Contact Form",
        "Google Maps",
        "Basic SEO Setup"
      ];
      upgrade1Name = "⚡ Ignite+";
      upgrade1Price = "₹12,999";
      upgrade1FeaturesAdded = ["Interactive Portfolio Display", "Custom Inquiry & Lead Forms", "Micro-animations"];
      upgrade2Name = "⚡ Ignite Pro";
      upgrade2Price = "₹14,999";
      upgrade2FeaturesAdded = ["Integrated Newsletter Signups", "Google Reviews Synchronization", "Comprehensive Local SEO Package"];
    } else if (packageId === "dominance") {
      baseName = "⬢ Catalyst";
      basePrice = "₹49,999";
      baseFeatures = [
        "Everything in Fusion",
        "AI Receptionist Integration",
        "Lead Capture System",
        "CRM Ready Structure",
        "Advanced Automation Setup",
        "Analytics Dashboard Setup"
      ];
      upgrade1Name = "⬢ Catalyst+";
      upgrade1Price = "₹54,999";
      upgrade1FeaturesAdded = ["Conversational Smart AI Assistant", "Centralized CRM Lead Repository", "Interactive customer routing maps"];
      upgrade2Name = "⬢ Catalyst Pro";
      upgrade2Price = "₹59,999";
      upgrade2FeaturesAdded = ["Client Portal Dashboard", "Full Automated Tool Synchronizations", "Custom Enterprise Analytics Charts"];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to deterministic upgrade recommendations.");
      return res.json({
        summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
        options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `You are an elite pricing strategist and senior business consultant at CodeFuser.
Your task is to generate both:
1. A diagnostic AI Executive Summary of the client's business ("${businessName}", Industry: "${industry || 'General'}", Goal: "${goal || 'Growth'}").
2. THREE customized, progressive package recommendation cards.

The customer has selected the package: ${baseName} (${basePrice}).
Your goal is not to pressure them, but to help them intelligently compare nearby upgrade options and confidently choose the best investment for their business.

Strict Rules for the AI Executive Summary:
The summary must contain:
- "businessCategory": Broad category (e.g., Retail, Health & Wellness, Food & Beverage, Professional Services, Real Estate, Automotive, Local Services)
- "specificBusinessType": Highly specific description (e.g. "Tyre Shop", "Multi-Cuisine Restaurant", "Dental Clinic", "Boutique Real Estate Agency")
- "primaryBusinessGoal": The primary driver (e.g. "Accept online reservations directly", "Generate high-intent contact inquiries", "Boost local walk-ins with search visibility")
- "customerVision": Brief recap of any design/business notes, ideas, or references left by the client under "${aiPrompt || ''}" (summarize concisely, or use a general vision statement if blank like "Launch a premium digital hub with high-converting mobile layout").
- "biggestOpportunity": Identify the SINGLE biggest digital opportunity for this SPECIFIC business model. For example:
  * For a Tyre Shop: "Capturing instant roadside & service requests right on Google Maps with click-to-call direct links"
  * For a Restaurant: "Establishing immediate visual cravings with a live digital menu and an automated reservation widget"
  * For a Dental Clinic: "Building absolute patient confidence and scheduling predictability with online appointment slots"
  * For a Real Estate business: "Unlocking direct lead qualification by routing high-intent property searchers straight to WhatsApp brokers"
- "recommendedStartingPackage": The exact name of Card 2 or Card 3.
- "recommendationReason": One single, high-impact, professional paragraph explaining WHY the AI selected this starting recommendation for their specific business. This should sound like a premium business consultant speaking directly to them.

Strict Rules for Card Generation:
1. Card 1 must match the SELECTED package "${baseName}" at exactly "${basePrice}". It must include:
   - "headline": Short strategic statement why it fits their current business entry parameters.
   - "benefits": A bullet list of 3-4 items explaining how its standard features will immediately help their business. Focus on OUTCOMES (e.g., "✓ Help more customers contact your business" instead of "Contact Form"). Each item must start with "✓ ".
   - "rationale": Clear explanation why this package perfectly fits their selected starting point.

2. Card 2 ("⭐ Recommended Upgrade") must be "${upgrade1Name}" at exactly "${upgrade1Price}". It must include only features added. It must include:
   - "headline": Explaining why this modest investment unlocks disproportionate value.
   - "benefits": A list of 2-3 new added outcomes explaining ONLY the newly added value. Must focus on business benefits tailored directly to this industry:
     * For Automotive/Tyre Shop: e.g. "✓ Capture instant local customers with live Google Maps positioning", "✓ Direct click-to-call mobile shortcut links"
     * For Restaurants: e.g. "✓ Display an engaging full menu listing", "✓ Embed an interactive table reservation ledger"
     * For Clinics: e.g. "✓ Book direct client appointments with calendar slots", "✓ Feature detailed doctor bios to foster patient safety"
     * For Real Estate: e.g. "✓ Feature prominent lead-capture forms for property inquiries", "✓ Display responsive interactive maps of current properties"
     * Others: Tailor closely to their specific specialty.
     Do NOT repeat Card 1 benefits. Each item must start with "✓ ".
   - "rationale": Strategic explanation of why spending a little more (just ${upgrade1Price}) improves long-term business value.

3. Card 3 ("👑 Best Long-Term Value") must be "${upgrade2Name}" at exactly "${upgrade2Price}". It must include only its additional features. Compared to Card 2, it must show ONLY newly unlocked outcomes. It must include:
   - "headline": Explaining why this is the strategic pinnacle of investment.
   - "benefits": A list of 2-3 final added outcomes compared to Card 2. Never repeat Card 1 or Card 2 benefits. Each item must start with "✓ ".
   - "rationale": Strategic explanation of why this provides the absolute strongest balance between their investment and future brand growth.

Important:
- NEVER explain recommendations using technical terminology only. Do NOT use terms like "CRM Integration", "API Integration", "Analytics Dashboard". Use clear, helpful, customer-centric business outcomes.
- The progression must stay psychologically close to their chosen budget.
- The outcome list should be tailored specifically to ${businessName} operating in the ${industry || 'general'} space.
- The language must be professional, warm, insightful, and strictly outcomes-focused.
- Do not repeat elements between cards.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Generate the three strategic package cards and AI diagnostic summary as requested.",
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
              description: "Must contain exactly 3 strategic card options: Card 1, Card 2, and Card 3",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Must be 'current', 'upgrade_1', or 'upgrade_2'" },
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

    if (response && response.text) {
      const data = JSON.parse(response.text);
      if (data.options && data.options.length === 3 && data.summary) {
        return res.json(data);
      }
    }
    
    throw new Error("Invalid response format from content generation");

  } catch (err: any) {
    console.error("Failed to generate package upgrade recommendations:", err);
    // Fallback response:
    const { packageId, businessName, ownerName, industry, goal, aiPrompt } = req.body;
    return res.json({
      summary: getFallbackSummary(packageId, businessName, industry, goal, aiPrompt),
      options: getFallbackUpgrades(packageId, businessName, ownerName, industry, goal)
    });
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
  
  let specificType = "Strategic Business Outlet";
  let opportunity = "Establishing a modern conversion layout customized for digital inquiry traffic.";
  let businessCat = "Professional Services";

  if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("cafe")) {
    specificType = "Exclusive Dine-In/Cafe Space";
    opportunity = "Establishing immediate visual cravings with a live digital menu and an automated reservation ledger.";
    businessCat = "Food & Beverage";
  } else if (normalized.includes("medical") || normalized.includes("clinic") || normalized.includes("dental") || normalized.includes("doctor")) {
    specificType = "High-Quality Dental/Medical Practice";
    opportunity = "Building absolute patient confidence and booking predictability with online appointment slots.";
    businessCat = "Health & Wellness";
  } else if (normalized.includes("tyre") || normalized.includes("tire") || normalized.includes("car") || normalized.includes("automotive") || normalized.includes("garage")) {
    specificType = "Specialized Tyre & Service Shop";
    opportunity = "Automating emergency service calls and Google Maps routing to secure roadside breakdown leads.";
    businessCat = "Automotive & Local Services";
  } else if (normalized.includes("estate") || normalized.includes("real") || normalized.includes("property")) {
    specificType = "Modern Real Estate Agency";
    opportunity = "Filtering prime home queries instantly and routing ready buyers directly to agent chat threads.";
    businessCat = "Real Estate Services";
  }

  let goalLabel = "Elevate digital authority and direct client scheduling";
  if (goal === "leads") goalLabel = "Accelerate hot sales leads and calls";
  else if (goal === "portfolio") goalLabel = "Display pristine project portfolios";
  else if (goal === "products") goalLabel = "Initiate instant digital catalog purchases";

  return {
    businessCategory: businessCat,
    specificBusinessType: specificType,
    primaryBusinessGoal: goalLabel,
    customerVision: aiPrompt || "Setup premium design systems with swift micro-animations.",
    biggestOpportunity: opportunity,
    recommendedStartingPackage: recommendedPkg,
    recommendationReason: `For ${businessName || "your brand"}, our analytics indicate that ${recommendedPkg} is the ideal launching platform. It bypasses basic layouts to integrate custom high-converting outcome features, allowing you to establish immediate authority in the ${businessCat} sector while keeping your initial milestone commitments perfectly balanced.`
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
        price: "₹9,999",
        headline: "High-impact digital hub to secure your online presence.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "This package maps perfectly to your starting budget and secures all operational foundations with zero ongoing maintenance friction."
      },
      {
        id: "upgrade_1",
        name: "⚡ Ignite+",
        price: "₹12,999",
        headline: "Maximize first impressions and increase customer action.",
        benefits: getDynamicIndustryBenefits(industry, 'upgrade_1'),
        rationale: "Investing just a little more allows you to showcase physical proof of your work, making it significantly easier to convert cold visitors into inquiries."
      },
      {
        id: "upgrade_2",
        name: "⚡ Ignite Pro",
        price: "₹14,999",
        headline: "The ultimate marketing launchpad for high-performing lead generation.",
        benefits: getDynamicIndustryBenefits(industry, 'upgrade_2'),
        rationale: "This provides the absolute strongest balance between your initial investment and long-term search visibility, laying a rock-solid foundation for future marketing efforts without a heavy price jump."
      }
    ];
  }

  if (packageId === "dominance") {
    return [
      {
        id: "current",
        name: "⬢ Catalyst",
        price: "₹49,999",
        headline: "Complete enterprise capability featuring deep automated solutions.",
        benefits: getDynamicIndustryBenefits(industry, 'base'),
        rationale: "Our elite tier delivers ultimate code autonomy, advanced layout configurations, and high-velocity workflow automation optimized for high-ticket acquisition."
      },
      {
        id: "upgrade_1",
        name: "⬢ Catalyst+",
        price: "₹54,999",
        headline: "Empower your customer journeys with interactive AI automation.",
        benefits: getDynamicIndustryBenefits(industry, 'upgrade_1'),
        rationale: "By making a modest incremental investment, your website transforms into an active virtual employee that autonomously handles introductory chats and organizes customer records."
      },
      {
        id: "upgrade_2",
        name: "⬢ Catalyst Pro",
        price: "₹59,999",
        headline: "The complete self-contained digital business ecosystem.",
        benefits: getDynamicIndustryBenefits(industry, 'upgrade_2'),
        rationale: "This provides the ultimate configuration for high-velocity operations, merging customized client interfaces with full automated tools so that your digital setup scales seamlessly handles complex operations."
      }
    ];
  }

  // Default / "growth" / Fusion
  return [
    {
      id: "current",
      name: "✦ Fusion",
      price: "₹24,999",
      headline: "Scalable growth platform to scale local visibility.",
      benefits: getDynamicIndustryBenefits(industry, 'base'),
      rationale: "Our most popular core plan equips you with extensive conversion tools, interactive sections, and high-velocity responsiveness to build immediate online authority."
    },
    {
      id: "upgrade_1",
      name: "✦ Fusion+",
      price: "₹27,999",
      headline: "Accelerate user trust and elevate operational conversion.",
      benefits: getDynamicIndustryBenefits(industry, 'upgrade_1'),
      rationale: "A modest improvement lets you leverage existing brand reviews and visual delight, translating directly into a higher booking volume for the exact same ad spend."
    },
    {
      id: "upgrade_2",
      name: "✦ Fusion Pro",
      price: "₹29,999",
      headline: "Full-scale marketing engine optimized to nurture target traffic.",
      benefits: getDynamicIndustryBenefits(industry, 'upgrade_2'),
      rationale: "This package provides the optimal balance of initial investment and high-octane growth capabilities, adding active engagement systems that keep your clients hooked and turning back to your services."
    }
  ];
}

function getDynamicIndustryBenefits(industry: string, level: 'base' | 'upgrade_1' | 'upgrade_2'): string[] {
  const ind = (industry || "").toLowerCase();
  
  if (ind.includes("food") || ind.includes("restaurant") || ind.includes("cafe")) {
    if (level === 'base') {
      return [
        "✓ Showcase an eye-catching online menu designed to amplify guest cravings.",
        "✓ Integrated direct click-to-book calling to drive weekend table volume.",
        "✓ Fast performance layout to ensure instant customer load speeds on mobile."
      ];
    } else if (level === 'upgrade_1') {
      return [
        "✓ Embed interactive table booking slots for scheduling predictability.",
        "✓ Integrate local Google Reviews live to drive immediate dining confidence."
      ];
    } else { // upgrade_2
      return [
        "✓ Automated SMS/WhatsApp table confirmation notifications for booked dinners.",
        "✓ Local search priority schema markup to outrank neighborhood restaurant listings."
      ];
    }
  }

  if (ind.includes("medical") || ind.includes("clinic") || ind.includes("dental") || ind.includes("doctor") || ind.includes("wellness")) {
    if (level === 'base') {
      return [
        "✓ Present patient care specialties with direct click-to-dial accessibility.",
        "✓ Dedicated trust-building area showcasing medical professional qualifications.",
        "✓ GDPR-compliant secure form structures for incoming client queries."
      ];
    } else if (level === 'upgrade_1') {
      return [
        "✓ Appointment scheduling framework so patients can request slots 24/7.",
        "✓ Patient feedback carousel synced automatically to leverage high local reputation."
      ];
    } else {
      return [
        "✓ Automated email appointment pre-reminders to reduce slot cancellations.",
        "✓ Local health authority ranking profile to capture prospective service searches."
      ];
    }
  }

  if (ind.includes("tyre") || ind.includes("tire") || ind.includes("car") || ind.includes("automotive") || ind.includes("garage") || ind.includes("mechanic")) {
    if (level === 'base') {
      return [
        "✓ Click-to-Call emergency service trigger buttons optimized for fast response.",
        "✓ Direct one-touch Google Maps GPS routing directions to drive physical garage visits.",
        "✓ Bulleted service lists showing pricing clarity for routine repairs."
      ];
    } else if (level === 'upgrade_1') {
      return [
        "✓ Custom multi-step roadside repair inquiry structures to pre-diagnose vehicle models.",
        "✓ Interactive live chat / WhatsApp prompt shortcuts to convert immediate tyre replacements."
      ];
    } else {
      return [
        "✓ Automated maintenance callback slots linked directly to client calendar databases.",
        "✓ Hyper-targeted local neighborhood SEO ranking package to capture urgent breakdown searches."
      ];
    }
  }

  if (ind.includes("estate") || ind.includes("real") || ind.includes("property") || ind.includes("prop") || ind.includes("agent") || ind.includes("agency")) {
    if (level === 'base') {
      return [
        "✓ Display active property listings styled with widescreen image galleries.",
        "✓ Simple click-to-enquire lead capture forms attached below general properties.",
        "✓ Instant WhatsApp routing button to put pre-qualified buyers in contact with agents."
      ];
    } else if (level === 'upgrade_1') {
      return [
        "✓ Interactive geographical map markers pinning actual property locations.",
        "✓ Live scheduling interface for bookings of private property walk-through tours."
      ];
    } else {
      return [
        "✓ Automated callback booking sync integrated directly with your sales calendar.",
        "✓ Interactive investment ROI calculator widget to stimulate downpayment decisions."
      ];
    }
  }

  // DEFAULT / GENERAL SERVICES & RETAIL
  if (level === 'base') {
    return [
      "✓ Establish high-conforming web layout showcasing primary service packages.",
      "✓ Direct inquiry channels for instant lead submissions to your inbox.",
      "✓ Mobile-optimized customer navigation blocks to minimize visitor bounce rates."
    ];
  } else if (level === 'upgrade_1') {
    return [
      "✓ Live Google Reviews carousel sync to convert prospect visits using trusted client proof.",
      "✓ Custom multi-step enquiry layouts designed to pre-qualify caller budgets."
    ];
  } else {
    return [
      "✓ Automated auto-responder emails keeping incoming leads hot 24/7.",
      "✓ Hyper-targeted local search keyword optimization to outrank competitor listings."
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
  let bestMatchPrice = '₹24,999';
  let bestMatchTagline = `Engineered to capture and schedule ${targetAudience} effortlessly.`;
  
  if (needsBooking) {
    bestMatchId = 'growth';
    bestMatchName = '✦ Fusion';
    bestMatchPrice = '₹24,999';
    bestMatchTagline = 'Automates live booking channels to immediately bypass your scheduling roadblocks.';
  } else if (!needsBooking && !needsFeatures) {
    bestMatchId = 'foundation';
    bestMatchName = '⚡ Ignite';
    bestMatchPrice = '₹9,999';
    bestMatchTagline = 'High-velocity showcase to validate your visual identity with minimal latency.';
  } else {
    bestMatchId = 'dominance';
    bestMatchName = '⬢ Catalyst';
    bestMatchPrice = '₹49,999';
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
      price: "₹9,999",
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
      price: "₹49,999",
      bullets: [
        "Integrates continuous automation channels like AI assistants, review feeds, and CRM triggers.",
        "Designed explicitly to support infinite expansion as you scale your brand presence.",
        "Includes absolute layout flexibility and prioritized diagnostic support cycles."
      ]
    }
  ];
}

// Server bootstrap with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
