import { createClient } from "@supabase/supabase-js";

export interface ProjectRecord {
  id: string;
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
}

// Lazy Supabase Client
let supabaseClient: any = null;
function getSupabase() {
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
    ...proj,
  };

  const supabase = getSupabase();
  console.log("Saving project directly to Supabase table 'projects'...");
  
  const { error } = await supabase
    .from("projects")
    .insert([
      {
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
      }
    ]);
  
  if (error) {
    throw new Error(`Supabase integration error: ${error.message}`);
  }

  console.log("Successfully synchronized to Supabase!");
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

  return data.map((item: any) => ({
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
  }));
}
