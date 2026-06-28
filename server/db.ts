import { createClient } from "@supabase/supabase-js";
import { getExtraData, readStore, writeStore } from "./extra_store";

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
}

// Lazy Supabase Client
let supabaseClient: any = null;
export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase credentials are not configured in environment (missing SUPABASE_URL or SUPABASE_ANON_KEY).");
    }
    console.log("Supabase config detected. Initializing Supabase client.");
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

export async function addProject(proj: Omit<ProjectRecord, "id" | "timestamp" | "status">): Promise<ProjectRecord> {
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
    ...proj,
  };

  const supabase = getSupabase();
  console.log("Saving project directly to Supabase table 'projects'...");
  
  const payload: any = {
    id: newProject.id,
    client_name: newProject.clientName,
    business_name: newProject.businessName,
    email: newProject.email,
    whatsapp: newProject.whatsapp,
    selected_package: newProject.selectedPackage,
    ownership_choice: newProject.ownershipChoice,
    industry: newProject.industry,
    custom_industry: newProject.customIndustry,
    goal: newProject.goal,
    custom_goal: newProject.customGoal,
    has_domain: newProject.hasDomain,
    has_logo: newProject.hasLogo,
    content_ready: newProject.contentReady,
    timestamp: newProject.timestamp,
    status: newProject.status,
  };

  if (newProject.userId) {
    payload.user_id = newProject.userId;
  }
  
  let { error } = await supabase
    .from("projects")
    .insert([payload]);

  // If the user_id column lacks representation in the user's remote schema, gracefully bypass
  if (error && (error.message.includes("user_id") || error.message.includes("column"))) {
    console.warn("user_id column is absent or caused a database constraints warning. Retrying insert without user_id.");
    delete payload.user_id;
    const retry = await supabase
      .from("projects")
      .insert([payload]);
    error = retry.error;
  }
  
  if (error) {
    throw new Error(`Supabase integration error: ${error.message}`);
  }

  // Also initialize extra store values for the new project
  const extra = getExtraData(newProject.id);
  extra.paymentStatus = newProject.paymentStatus;
  extra.portalAccess = newProject.portalAccess;
  extra.paymentProvider = newProject.paymentProvider;
  extra.paymentId = newProject.paymentId;
  extra.orderId = newProject.orderId;
  extra.purchasedPlan = newProject.purchasedPlan;
  extra.purchaseDate = newProject.purchaseDate;
  extra.portalAccessSource = newProject.portalAccessSource;
  const store = readStore();
  store[newProject.id] = extra;
  writeStore(store);

  console.log("Successfully synchronized to Supabase and extra store!");
  return newProject;
}

export async function getProjects(): Promise<ProjectRecord[]> {
  const supabase = getSupabase();
  console.log("Retrieving projects from Supabase...");
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  if (!data) return [];

  return data.map((item: any) => {
    const extra = getExtraData(item.id);
    return {
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
      paymentStatus: item.payment_status || item.paymentStatus || extra.paymentStatus || "unpaid",
      portalAccess: item.portal_access !== undefined ? item.portal_access : (item.portalAccess !== undefined ? item.portalAccess : (extra.portalAccess ?? false)),
      paymentProvider: item.payment_provider || item.paymentProvider || extra.paymentProvider || "",
      paymentId: item.payment_id || item.paymentId || extra.paymentId || "",
      orderId: item.order_id || item.orderId || extra.orderId || "",
      purchasedPlan: item.purchased_plan || item.purchasedPlan || extra.purchasedPlan || "",
      purchaseDate: item.purchase_date || item.purchaseDate || extra.purchaseDate || "",
      portalAccessSource: item.portal_access_source || item.portalAccessSource || extra.portalAccessSource || "automatic",
    };
  });
}

export async function updateProject(id: string, updates: Partial<ProjectRecord>): Promise<ProjectRecord> {
  const supabase = getSupabase();
  console.log(`Updating project ${id} in Supabase...`);
  
  // Sync with extra store first
  if (
    updates.paymentStatus !== undefined ||
    updates.portalAccess !== undefined ||
    updates.paymentProvider !== undefined ||
    updates.paymentId !== undefined ||
    updates.orderId !== undefined ||
    updates.purchasedPlan !== undefined ||
    updates.purchaseDate !== undefined ||
    updates.portalAccessSource !== undefined
  ) {
    const store = readStore();
    if (!store[id]) {
      store[id] = { projectId: id, quote: null, assets: [] };
    }
    if (updates.paymentStatus !== undefined) store[id].paymentStatus = updates.paymentStatus;
    if (updates.portalAccess !== undefined) store[id].portalAccess = updates.portalAccess;
    if (updates.paymentProvider !== undefined) store[id].paymentProvider = updates.paymentProvider;
    if (updates.paymentId !== undefined) store[id].paymentId = updates.paymentId;
    if (updates.orderId !== undefined) store[id].orderId = updates.orderId;
    if (updates.purchasedPlan !== undefined) store[id].purchasedPlan = updates.purchasedPlan;
    if (updates.purchaseDate !== undefined) store[id].purchaseDate = updates.purchaseDate;
    if (updates.portalAccessSource !== undefined) store[id].portalAccessSource = updates.portalAccessSource;
    writeStore(store);
  }

  // Map our camelCase fields to snake_case table columns
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.hasDomain !== undefined) dbUpdates.has_domain = updates.hasDomain;
  if (updates.hasLogo !== undefined) dbUpdates.has_logo = updates.hasLogo;
  if (updates.contentReady !== undefined) dbUpdates.content_ready = updates.contentReady;
  
  // Also support updating general values if passed
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
  if (updates.selectedPackage !== undefined) dbUpdates.selected_package = updates.selectedPackage;
  if (updates.ownershipChoice !== undefined) dbUpdates.ownership_choice = updates.ownershipChoice;

  // Add payment_status and portal_access for forward compatibility
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.portalAccess !== undefined) dbUpdates.portal_access = updates.portalAccess;

  let { data, error } = await supabase
    .from("projects")
    .update(dbUpdates)
    .eq("id", id)
    .select();
    
  // If columns don't exist in Supabase schema, retry update without them
  if (error && (error.message.includes("payment_status") || error.message.includes("portal_access") || error.message.includes("column"))) {
    console.warn("payment_status or portal_access column is absent. Retrying update without them.");
    delete dbUpdates.payment_status;
    delete dbUpdates.portal_access;
    const retry = await supabase
      .from("projects")
      .update(dbUpdates)
      .eq("id", id)
      .select();
    data = retry.data;
    error = retry.error;
  }
     
  if (error) {
    throw new Error(`Supabase update error: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error(`Project with ID ${id} not found.`);
  }
  
  const item = data[0];
  const extra = getExtraData(item.id);
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
    paymentStatus: item.payment_status || item.paymentStatus || extra.paymentStatus || "unpaid",
    portalAccess: item.portal_access !== undefined ? item.portal_access : (item.portalAccess !== undefined ? item.portalAccess : (extra.portalAccess ?? false)),
    paymentProvider: item.payment_provider || item.paymentProvider || extra.paymentProvider || "",
    paymentId: item.payment_id || item.paymentId || extra.paymentId || "",
    orderId: item.order_id || item.orderId || extra.orderId || "",
    purchasedPlan: item.purchased_plan || item.purchasedPlan || extra.purchasedPlan || "",
    purchaseDate: item.purchase_date || item.purchaseDate || extra.purchaseDate || "",
    portalAccessSource: item.portal_access_source || item.portalAccessSource || extra.portalAccessSource || "automatic",
  };
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  try {
    const projects = await getProjects();
    return projects.find(p => p.id === id) || null;
  } catch (err) {
    console.error(`Failed to get project by ID ${id}:`, err);
    return null;
  }
}

