import fs from "fs";
import path from "path";

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

const STORE_FILE = path.join(process.cwd(), "server", "fuser_extra_store.json");

// Ensure store directory exists
function ensureFile() {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({}), "utf8");
  }
}

export function readStore(): Record<string, ExtraProjectData> {
  ensureFile();
  try {
    const content = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Failed to read fuser_extra_store.json:", err);
    return {};
  }
}

export function writeStore(data: Record<string, ExtraProjectData>) {
  ensureFile();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write fuser_extra_store.json:", err);
  }
}

export function getExtraData(projectId: string): ExtraProjectData {
  const store = readStore();
  if (!store[projectId]) {
    store[projectId] = {
      projectId,
      quote: null,
      assets: [],
      paymentStatus: "unpaid",
      portalAccess: false,
      paymentProvider: "",
      paymentId: "",
      orderId: "",
      purchasedPlan: "",
      purchaseDate: "",
      portalAccessSource: "automatic"
    };
    writeStore(store);
  } else {
    let modified = false;
    if (store[projectId].paymentStatus === undefined) {
      store[projectId].paymentStatus = "unpaid";
      modified = true;
    }
    if (store[projectId].portalAccess === undefined) {
      store[projectId].portalAccess = false;
      modified = true;
    }
    if (store[projectId].paymentProvider === undefined) {
      store[projectId].paymentProvider = "";
      modified = true;
    }
    if (store[projectId].paymentId === undefined) {
      store[projectId].paymentId = "";
      modified = true;
    }
    if (store[projectId].orderId === undefined) {
      store[projectId].orderId = "";
      modified = true;
    }
    if (store[projectId].purchasedPlan === undefined) {
      store[projectId].purchasedPlan = "";
      modified = true;
    }
    if (store[projectId].purchaseDate === undefined) {
      store[projectId].purchaseDate = "";
      modified = true;
    }
    if (store[projectId].portalAccessSource === undefined) {
      store[projectId].portalAccessSource = "automatic";
      modified = true;
    }
    if (modified) {
      writeStore(store);
    }
  }
  
  // Dynamically update quote status on retrieval if expired
  const data = store[projectId];
  if (data.quote && data.quote.status !== "expired") {
    const now = new Date();
    const expiry = new Date(data.quote.expiryDate);
    if (now > expiry) {
      data.quote.status = "expired";
      writeStore(store);
    } else {
      // Check if expiring soon (less than 24 hours left)
      const diffMs = expiry.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours <= 24 && data.quote.status !== "expiring") {
        data.quote.status = "expiring";
        writeStore(store);
      }
    }
  }
  
  return data;
}

export function updateQuote(projectId: string, quote: Omit<OfficialQuoteRecord, "status" | "expiryDate" | "timestamp"> | null): ExtraProjectData {
  const store = readStore();
  if (!store[projectId]) {
    store[projectId] = { projectId, quote: null, assets: [] };
  }
  
  if (quote === null) {
    store[projectId].quote = null;
  } else {
    const timestamp = new Date().toISOString();
    // Expiry date is 7 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    
    store[projectId].quote = {
      ...quote,
      timestamp,
      expiryDate: expiry.toISOString(),
      status: "active"
    };
  }
  
  writeStore(store);
  return store[projectId];
}

export function addAssetFile(projectId: string, file: Omit<AssetFileRecord, "id" | "timestamp">): ExtraProjectData {
  const store = readStore();
  if (!store[projectId]) {
    store[projectId] = { projectId, quote: null, assets: [] };
  }
  
  const newFile: AssetFileRecord = {
    ...file,
    id: `ASSET-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  store[projectId].assets.push(newFile);
  writeStore(store);
  return store[projectId];
}
