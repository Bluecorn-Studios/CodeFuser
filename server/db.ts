import { getExtraData } from "./extra_store.js";
import { withRetry } from "./retry.js";
import { getSupabase } from "./supabase.js";
import fs from "fs";
import path from "path";

const AUDIT_TRAIL_FILE = path.join(process.cwd(), "server", "fuser_audit_trail.json");

export function getLocalAuditTrail(): any[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  try {
    if (fs.existsSync(AUDIT_TRAIL_FILE)) {
      const data = fs.readFileSync(AUDIT_TRAIL_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[Audit Trail Fallback] Error reading local audit trail file:", err);
  }
  return [];
}

export function saveLocalAuditEvent(event: any) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  try {
    const events = getLocalAuditTrail();
    events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
    const dir = path.dirname(AUDIT_TRAIL_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(AUDIT_TRAIL_FILE, JSON.stringify(events, null, 2), "utf-8");
  } catch (err) {
    console.error("[Audit Trail Fallback] Error writing local audit trail file:", err);
  }
}

export interface ProjectRecord {
  id: string;
  userId?: string;
  clientName: string;
  businessName: string;
  email: string;
  whatsapp: string;
  selectedPackage: string;
  ownershipChoice: string;
  industry: string;
  customIndustry: string;
  goal: string;
  customGoal: string;
  hasDomain: string;
  hasLogo: string;
  contentReady: string;
  timestamp: string;
  status: string; // Initial Project Status = "Assets Pending"
  paymentStatus?: string; // 'paid' | 'unpaid'
  portalAccess?: boolean; // true | false
  paymentProvider?: string; // e.g. "razorpay"
  paymentId?: string; // e.g. "pay_XYZ"
  orderId?: string; // e.g. "order_XYZ"
  purchasedPlan?: string; // e.g. "Track A - custom"
  purchaseDate?: string; // ISO string
  portalAccessSource?: "automatic" | "manual"; // "automatic" | "manual"
  quote?: any;
  assets?: any[];
  aiPrompt?: string;
}

export async function addProject(proj: Omit<ProjectRecord, "id" | "timestamp" | "status">, reqId: string = "N/A"): Promise<ProjectRecord> {
  const newProject: ProjectRecord = {
    id: `PROJ-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: "Assets Pending",
    paymentStatus: "unpaid",
    portalAccess: false,
    paymentProvider: "",
    paymentId: "",
    orderId: "",
    purchasedPlan: "",
    purchaseDate: "",
    portalAccessSource: "automatic",
    aiPrompt: "",
    ...proj,
  };

  const supabase = getSupabase();
  console.log("Saving project directly to Supabase table 'projects'...");
  
  const payload: any = {
    id: newProject.id,
    client_name: newProject.clientName || "",
    business_name: newProject.businessName || "",
    email: newProject.email || "",
    whatsapp: newProject.whatsapp || "",
    selected_package: newProject.selectedPackage || "growth",
    ownership_choice: newProject.ownershipChoice || "",
    industry: newProject.industry || "",
    custom_industry: newProject.customIndustry || "",
    goal: newProject.goal || "",
    custom_goal: newProject.customGoal || "",
    has_domain: newProject.hasDomain || "",
    has_logo: newProject.hasLogo || "",
    content_ready: newProject.contentReady || "",
    timestamp: newProject.timestamp,
    status: newProject.status || "Assets Pending",
    payment_status: newProject.paymentStatus || "unpaid",
    portal_access: newProject.portalAccess ?? false,
    payment_provider: newProject.paymentProvider || "",
    payment_id: newProject.paymentId || "",
    order_id: newProject.orderId || "",
    purchased_plan: newProject.purchasedPlan || "",
    purchase_date: newProject.purchaseDate || null,
    portal_access_source: newProject.portalAccessSource || "automatic",
    quote: newProject.aiPrompt ? { aiPrompt: newProject.aiPrompt } : null,
    assets: []
  };

  if (newProject.userId) {
    payload.user_id = newProject.userId;
  }
  
  await withRetry(async () => {
    let { error } = await supabase
      .from("projects")
      .insert([payload]);

    if (error && (error.message.includes("user_id") || error.message.includes("column"))) {
      console.warn("user_id column is absent. Retrying insert without user_id.");
      const payloadNoUserId = { ...payload };
      delete payloadNoUserId.user_id;
      const retry = await supabase
        .from("projects")
        .insert([payloadNoUserId]);
      error = retry.error;
    }

    if (error) {
      throw new Error(`Supabase integration error: ${error.message}`);
    }
  }, {
    reqId,
    operationName: "Supabase INSERT (addProject)",
    isIdempotent: true
  });

  console.log("Successfully synchronized new project to Supabase!");
  return newProject;
}

export async function getProjects(reqId: string = "N/A", filter?: { userId?: string; email?: string }): Promise<ProjectRecord[]> {
  const supabase = getSupabase();
  console.log("Retrieving projects from Supabase (server-side filtered)...");
  
  const data = await withRetry(async () => {
    let query = supabase
      .from("projects")
      .select("*");

    if (filter) {
      if (filter.userId && filter.email) {
        // Find projects matching either the user ID OR the email address
        query = query.or(`user_id.eq.${filter.userId},email.eq.${filter.email.trim().toLowerCase()}`);
      } else if (filter.userId) {
        query = query.eq("user_id", filter.userId);
      } else if (filter.email) {
        query = query.eq("email", filter.email.trim().toLowerCase());
      }
    }

    const { data: resData, error } = await query.order("timestamp", { ascending: false });

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }
    return resData;
  }, {
    reqId,
    operationName: "Supabase SELECT (getProjects)",
    isIdempotent: true
  });

  if (!data) return [];

  const projects: ProjectRecord[] = [];
  
  for (const item of data) {
    projects.push({
      id: item.id || `PROJ-${Date.now()}`,
      clientName: item.client_name || item.clientName || "",
      businessName: item.business_name || item.businessName || "",
      email: item.email || "",
      whatsapp: item.whatsapp || "",
      selectedPackage: item.selected_package || item.selectedPackage || "",
      ownershipChoice: item.ownership_choice || item.ownershipChoice || "",
      industry: item.industry || "",
      customIndustry: item.custom_industry || item.customIndustry || "",
      goal: item.goal || "",
      customGoal: item.custom_goal || item.customGoal || "",
      hasDomain: item.has_domain || item.hasDomain || "",
      hasLogo: item.has_logo || item.hasLogo || "",
      contentReady: item.content_ready || item.contentReady || "",
      timestamp: item.timestamp || "",
      status: item.status || "Assets Pending",
      userId: item.user_id || item.userId || "",
      paymentStatus: item.payment_status !== null && item.payment_status !== undefined ? item.payment_status : "unpaid",
      portalAccess: item.portal_access !== null && item.portal_access !== undefined ? item.portal_access : false,
      paymentProvider: item.payment_provider || "",
      paymentId: item.payment_id || "",
      orderId: item.order_id || "",
      purchasedPlan: item.purchased_plan || "",
      purchaseDate: item.purchase_date || "",
      portalAccessSource: item.portal_access_source || "automatic",
      quote: item.quote || null,
      assets: item.assets || [],
      aiPrompt: item.quote?.aiPrompt || ""
    });
  }

  return projects;
}

export async function updateProject(id: string, updates: Partial<ProjectRecord>, reqId: string = "N/A"): Promise<ProjectRecord> {
  const supabase = getSupabase();
  console.log(`Updating project ${id} in Supabase...`);
  
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.hasDomain !== undefined) dbUpdates.has_domain = updates.hasDomain;
  if (updates.hasLogo !== undefined) dbUpdates.has_logo = updates.hasLogo;
  if (updates.contentReady !== undefined) dbUpdates.content_ready = updates.contentReady;
  
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
  if (updates.selectedPackage !== undefined) dbUpdates.selected_package = updates.selectedPackage;
  if (updates.ownershipChoice !== undefined) dbUpdates.ownership_choice = updates.ownershipChoice;

  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.portalAccess !== undefined) dbUpdates.portal_access = updates.portalAccess;
  if (updates.paymentProvider !== undefined) dbUpdates.payment_provider = updates.paymentProvider;
  if (updates.paymentId !== undefined) dbUpdates.payment_id = updates.paymentId;
  if (updates.orderId !== undefined) dbUpdates.order_id = updates.orderId;
  if (updates.purchasedPlan !== undefined) dbUpdates.purchased_plan = updates.purchasedPlan;
  if (updates.purchaseDate !== undefined) dbUpdates.purchase_date = updates.purchaseDate;
  if (updates.portalAccessSource !== undefined) dbUpdates.portal_access_source = updates.portalAccessSource;

  const data = await withRetry(async () => {
    const { data: resData, error } = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .select();
       
    if (error) {
      throw new Error(`Supabase update error: ${error.message}`);
    }
    return resData;
  }, {
    reqId,
    operationName: `Supabase UPDATE (updateProject ${id})`,
    isIdempotent: true
  });
  
  if (!data || data.length === 0) {
    throw new Error(`Project with ID ${id} not found.`);
  }
  
  const item = data[0];
  return {
    id: item.id,
    clientName: item.client_name || item.clientName || "",
    businessName: item.business_name || item.businessName || "",
    email: item.email || "",
    whatsapp: item.whatsapp || "",
    selectedPackage: item.selected_package || item.selectedPackage || "",
    ownershipChoice: item.ownership_choice || item.ownershipChoice || "",
    industry: item.industry || "",
    customIndustry: item.custom_industry || item.customIndustry || "",
    goal: item.goal || "",
    customGoal: item.custom_goal || item.customGoal || "",
    hasDomain: item.has_domain || item.hasDomain || "",
    hasLogo: item.has_logo || item.hasLogo || "",
    contentReady: item.content_ready || item.contentReady || "",
    timestamp: item.timestamp || "",
    status: item.status || "Assets Pending",
    userId: item.user_id || item.userId || "",
    paymentStatus: item.payment_status !== null && item.payment_status !== undefined ? item.payment_status : "unpaid",
    portalAccess: item.portal_access !== null && item.portal_access !== undefined ? item.portal_access : false,
    paymentProvider: item.payment_provider || "",
    paymentId: item.payment_id || "",
    orderId: item.order_id || "",
    purchasedPlan: item.purchased_plan || "",
    purchaseDate: item.purchase_date || "",
    portalAccessSource: item.portal_access_source || "automatic",
  };
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      clientName: data.client_name || data.clientName || "",
      businessName: data.business_name || data.businessName || "",
      email: data.email || "",
      whatsapp: data.whatsapp || "",
      selectedPackage: data.selected_package || data.selectedPackage || "",
      ownershipChoice: data.ownership_choice || data.ownershipChoice || "",
      industry: data.industry || "",
      customIndustry: data.custom_industry || data.customIndustry || "",
      goal: data.goal || "",
      customGoal: data.custom_goal || data.customGoal || "",
      hasDomain: data.has_domain || data.hasDomain || "",
      hasLogo: data.has_logo || data.hasLogo || "",
      contentReady: data.content_ready || data.contentReady || "",
      timestamp: data.timestamp || "",
      status: data.status || "Assets Pending",
      userId: data.user_id || data.userId || "",
      paymentStatus: data.payment_status !== null && data.payment_status !== undefined ? data.payment_status : "unpaid",
      portalAccess: data.portal_access !== null && data.portal_access !== undefined ? data.portal_access : false,
      paymentProvider: data.payment_provider || "",
      paymentId: data.payment_id || "",
      orderId: data.order_id || "",
      purchasedPlan: data.purchased_plan || "",
      purchaseDate: data.purchase_date || "",
      portalAccessSource: data.portal_access_source || "automatic",
      quote: data.quote || null,
      assets: data.assets || [],
      aiPrompt: data.quote?.aiPrompt || ""
    };
  } catch (err) {
    console.error(`Failed to get project by ID ${id}:`, err);
    return null;
  }
}

// Durable Cloud Audit Trail
export async function logAuditEvent(event: {
  projectId: string;
  eventType: string;
  requestId?: string;
  actor: "Client" | "Admin" | "System";
  status: "Success" | "Failed" | "Pending";
  notes?: string;
}) {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    // Always log to local backup file first so events are never lost
    saveLocalAuditEvent(event);
  } else {
    console.log(`[Audit Trail] Event logged: ${event.eventType} for project ${event.projectId} (${event.status})`);
  }

  const supabase = getSupabase();
  try {
    const { error } = await supabase.from("audit_trail").insert([{
      project_id: event.projectId,
      event_type: event.eventType,
      request_id: event.requestId || null,
      actor: event.actor,
      status: event.status,
      notes: event.notes || null,
    }]);
    if (error) {
      if (error.message?.includes("Could not find the table") || error.code === "PGRST205") {
        if (isProduction) {
          console.error(`[Audit Trail Error] Table public.audit_trail is not yet initialized in Supabase. Could not persist audit event in database.`);
        } else {
          console.warn(`[Audit Trail Notice] Table public.audit_trail is not yet initialized in Supabase. Successfully wrote event to local fallback.`);
        }
      } else {
        console.error("[Audit Trail Error] Failed to write event:", error.message);
      }
    }
  } catch (err: any) {
    console.error("[Audit Trail Error] Exception logging event:", err.message || err);
  }
}

export interface UserProfile {
  id: string;
  email: string;
  role: "super_admin" | "admin" | "client";
  fullName?: string;
  businessName?: string;
  createdAt?: string;
}

const USER_PROFILES_FILE = path.join(process.cwd(), "server", "fuser_user_profiles.json");

export function getLocalUserProfiles(): any[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  try {
    if (fs.existsSync(USER_PROFILES_FILE)) {
      const data = fs.readFileSync(USER_PROFILES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("[User Profile Fallback] Error reading local profiles file:", err);
  }
  return [];
}

export function saveLocalUserProfile(profile: any) {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  try {
    const profiles = getLocalUserProfiles();
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    if (existingIndex !== -1) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
    } else {
      profiles.push(profile);
    }
    const dir = path.dirname(USER_PROFILES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USER_PROFILES_FILE, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (err) {
    console.error("[User Profile Fallback] Error writing local profiles file:", err);
  }
}

export async function getUserProfile(id: string, reqId: string = "N/A"): Promise<UserProfile | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase select profile error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: `Supabase SELECT (getUserProfile ${id})`,
      isIdempotent: true
    });

    if (!data) {
      if (!isProduction) {
        // Try local fallback
        const localProfiles = getLocalUserProfiles();
        const localProfile = localProfiles.find(p => p.id === id);
        if (localProfile) {
          return {
            id: localProfile.id,
            email: localProfile.email,
            role: localProfile.role,
            fullName: localProfile.fullName || "",
            businessName: localProfile.businessName || "",
            createdAt: localProfile.createdAt || ""
          };
        }
      }
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role as any,
      fullName: data.full_name || "",
      businessName: data.business_name || "",
      createdAt: data.created_at || "",
    };
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to retrieve user profile ${id} from database:`, err.message || err);
      throw new Error("Unable to retrieve user profile due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to retrieve user profile ${id} from Supabase, attempting local fallback:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    const localProfile = localProfiles.find(p => p.id === id);
    if (localProfile) {
      return {
        id: localProfile.id,
        email: localProfile.email,
        role: localProfile.role,
        fullName: localProfile.fullName || "",
        businessName: localProfile.businessName || "",
        createdAt: localProfile.createdAt || ""
      };
    }
    return null;
  }
}

export async function createUserProfile(profile: Omit<UserProfile, "createdAt">, reqId: string = "N/A"): Promise<UserProfile> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  const newProfile = {
    id: profile.id,
    email: profile.email,
    role: profile.role || "client",
    full_name: profile.fullName || "",
    business_name: profile.businessName || "",
    created_at: new Date().toISOString()
  };

  const profileObj: UserProfile = {
    id: newProfile.id,
    email: newProfile.email,
    role: newProfile.role as any,
    fullName: newProfile.full_name,
    businessName: newProfile.business_name,
    createdAt: newProfile.created_at
  };

  try {
    await withRetry(async () => {
      const { error } = await supabase
        .from("user_profiles")
        .insert([newProfile]);

      if (error) {
        throw new Error(`Supabase insert profile error: ${error.message}`);
      }
    }, {
      reqId,
      operationName: "Supabase INSERT (createUserProfile)",
      isIdempotent: true
    });
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to create user profile in database:`, err.message || err);
      throw new Error("Unable to create user profile due to a temporary database connection issue. Please try again later.");
    }
    
    console.warn(`[User Profile Fallback] Failed to create user profile in Supabase, using local fallback:`, err.message || err);
    saveLocalUserProfile(profileObj);
  }

  return profileObj;
}

export async function updateUserProfileRole(id: string, role: string, reqId: string = "N/A"): Promise<UserProfile> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase update profile role error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: `Supabase UPDATE (updateUserProfileRole ${id})`,
      isIdempotent: true
    });

    return {
      id: data.id,
      email: data.email,
      role: data.role as any,
      fullName: data.full_name,
      businessName: data.business_name,
      createdAt: data.created_at
    };
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to update user profile in database:`, err.message || err);
      throw new Error("Unable to update user profile role due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to update user profile in Supabase, using local update fallback:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    const localProfile = localProfiles.find(p => p.id === id);
    if (localProfile) {
      localProfile.role = role;
      saveLocalUserProfile(localProfile);
      return {
        id: localProfile.id,
        email: localProfile.email,
        role: localProfile.role as any,
        fullName: localProfile.fullName,
        businessName: localProfile.businessName,
        createdAt: localProfile.createdAt
      };
    }
    throw err;
  }
}

export async function getAllUserProfiles(reqId: string = "N/A"): Promise<UserProfile[]> {
  const isProduction = process.env.NODE_ENV === "production";
  const supabase = getSupabase();
  try {
    const data = await withRetry(async () => {
      const { data: resData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Supabase select all profiles error: ${error.message}`);
      }
      return resData;
    }, {
      reqId,
      operationName: "Supabase SELECT (getAllUserProfiles)",
      isIdempotent: true
    });

    if (!data) return [];
    return data.map((item: any) => ({
      id: item.id,
      email: item.email,
      role: item.role as any,
      fullName: item.full_name,
      businessName: item.business_name,
      createdAt: item.created_at
    }));
  } catch (err: any) {
    if (isProduction) {
      console.error(`[User Profile Error] Failed to retrieve all profiles from database:`, err.message || err);
      throw new Error("Unable to retrieve user profiles due to a temporary database connection issue. Please try again later.");
    }

    console.warn(`[User Profile Fallback] Failed to get all profiles from Supabase, returning local profiles:`, err.message || err);
    const localProfiles = getLocalUserProfiles();
    return localProfiles.map(lp => ({
      id: lp.id,
      email: lp.email,
      role: lp.role,
      fullName: lp.fullName,
      businessName: lp.businessName,
      createdAt: lp.createdAt
    }));
  }
}
