import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase credentials are not configured in environment (missing SUPABASE_URL or SUPABASE_ANON_KEY).");
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}
