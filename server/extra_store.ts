import { getSupabase } from "./supabase.js";

export interface OfficialQuoteRecord {
  packageName: string;
  price: number;
  discount: number;
  features: string[];
  summary: string;
  timestamp: string; // ISO string
  expiryDate: string; // ISO string (7 days later)
  status: "active" | "expiring" | "expired";
}

export interface AssetFileRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: string;
}

export interface ExtraProjectData {
  projectId: string;
  quote: OfficialQuoteRecord | null;
  assets: AssetFileRecord[];
  paymentStatus?: string; // 'paid' | 'unpaid'
  portalAccess?: boolean; // true | false
  paymentProvider?: string; // e.g. "razorpay"
  paymentId?: string; // e.g. "pay_XYZ"
  orderId?: string; // e.g. "order_XYZ"
  purchasedPlan?: string; // e.g. "Track A - custom"
  purchaseDate?: string; // ISO string
  portalAccessSource?: "automatic" | "manual"; // "automatic" | "manual"
}

// virtual readStore / writeStore are no-ops to preserve import patterns or fallback logic if called elsewhere
export function readStore(): Record<string, ExtraProjectData> {
  console.warn("fuser_extra_store JSON store is obsolete. Data is now read from Supabase DB.");
  return {};
}

export function writeStore(data: Record<string, ExtraProjectData>) {
  console.warn("fuser_extra_store JSON store is obsolete. Data is now written directly to Supabase DB.");
}

export async function getExtraData(projectId: string): Promise<ExtraProjectData> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return {
      projectId,
      quote: null,
      assets: []
    };
  }

  const extra: ExtraProjectData = {
    projectId,
    quote: data.quote || null,
    assets: data.assets || [],
    paymentStatus: data.payment_status || "unpaid",
    portalAccess: data.portal_access || false,
    paymentProvider: data.payment_provider || "",
    paymentId: data.payment_id || "",
    orderId: data.order_id || "",
    purchasedPlan: data.purchased_plan || "",
    purchaseDate: data.purchase_date || "",
    portalAccessSource: data.portal_access_source || "automatic"
  };

  // Dynamically update quote status on retrieval if expired
  if (extra.quote && extra.quote.status !== "expired") {
    const now = new Date();
    const expiry = new Date(extra.quote.expiryDate);
    if (now > expiry) {
      extra.quote.status = "expired";
      // Save the updated status back to DB asynchronously
      supabase.from("projects").update({ quote: extra.quote }).eq("id", projectId).then();
    } else {
      // Check if expiring soon (less than 24 hours left)
      const diffMs = expiry.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && extra.quote.status !== "expiring") {
        extra.quote.status = "expiring";
        supabase.from("projects").update({ quote: extra.quote }).eq("id", projectId).then();
      }
    }
  }

  // Generate secure signed URLs for private assets stored in Supabase Storage buckets
  if (extra.assets && extra.assets.length > 0) {
    const bucketName = "codefuser-assets";
    const signedAssets: AssetFileRecord[] = [];
    
    for (const asset of extra.assets) {
      if (asset.url && (asset.url.startsWith("/uploads/") || asset.url.startsWith("http://") || asset.url.startsWith("https://"))) {
        // Legacy local uploads or already fully-qualified URLs: serve directly to preserve backwards compatibility
        signedAssets.push(asset);
      } else if (asset.url) {
        // This is a private Supabase Storage object path (e.g. "PROJ-123/filename.png")
        try {
          const pathKey = asset.url.replace(/^storage:\/\/codefuser-assets\//, "");
          const { data: signedData, error: signError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(pathKey, 3600); // 1-hour expiration

          if (!signError && signedData) {
            signedAssets.push({
              ...asset,
              url: signedData.signedUrl
            });
          } else {
            console.error(`[Signed URL Error] Failed to generate for path ${pathKey}:`, signError?.message);
            signedAssets.push(asset);
          }
        } catch (err) {
          console.error("[Signed URL Catch] Failed for asset:", err);
          signedAssets.push(asset);
        }
      } else {
        signedAssets.push(asset);
      }
    }
    extra.assets = signedAssets;
  }

  return extra;
}

export async function updateQuote(
  projectId: string,
  quote: Omit<OfficialQuoteRecord, "status" | "expiryDate" | "timestamp"> | null
): Promise<ExtraProjectData> {
  const supabase = getSupabase();
  let dbQuote: OfficialQuoteRecord | null = null;

  if (quote !== null) {
    const timestamp = new Date().toISOString();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // Valid for 7 days

    dbQuote = {
      ...quote,
      timestamp,
      expiryDate: expiry.toISOString(),
      status: "active"
    };
  }

  const { error } = await supabase
    .from("projects")
    .update({ quote: dbQuote })
    .eq("id", projectId);

  if (error) {
    throw new Error(`Failed to update quote in Supabase: ${error.message}`);
  }

  return getExtraData(projectId);
}

export async function addAssetFile(
  projectId: string,
  file: Omit<AssetFileRecord, "id" | "timestamp">
): Promise<ExtraProjectData> {
  const supabase = getSupabase();

  // Retrieve current assets array
  const { data: projData, error: fetchErr } = await supabase
    .from("projects")
    .select("assets")
    .eq("id", projectId)
    .single();

  if (fetchErr) {
    throw new Error(`Failed to retrieve project assets for update: ${fetchErr.message}`);
  }

  const existingAssets: AssetFileRecord[] = projData?.assets || [];
  const newFile: AssetFileRecord = {
    ...file,
    id: `ASSET-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  const updatedAssets = [...existingAssets, newFile];

  const { error: updateErr } = await supabase
    .from("projects")
    .update({ assets: updatedAssets })
    .eq("id", projectId);

  if (updateErr) {
    throw new Error(`Failed to append uploaded asset: ${updateErr.message}`);
  }

  return getExtraData(projectId);
}
