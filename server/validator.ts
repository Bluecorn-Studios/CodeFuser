import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export interface ValidationRule {
  type: "string" | "number" | "boolean" | "array";
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  itemsType?: "string";
  allowEmpty?: boolean;
  isEmail?: boolean;
  isPhone?: boolean;
  isProjectId?: boolean;
  isBase64?: boolean;
}

export type Schema = Record<string, ValidationRule>;

// Helper to check for prototype pollution recursively
export function hasPrototypePollution(obj: any): boolean {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return true;
      }
      if (typeof obj[key] === "object" && hasPrototypePollution(obj[key])) {
        return true;
      }
    }
  }
  return false;
}

// XSS and SQL Injection signature check
export function containsMaliciousPayload(value: string): boolean {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror\s*=|onload\s*=|eval\(|document\.cookie/i;
  const sqlPattern = /'\s*--|'\s*OR\s*['"]?1['"]?\s*=\s*['"]?1|UNION\s+SELECT|DROP\s+TABLE|INSERT\s+INTO/i;
  return xssPattern.test(value) || sqlPattern.test(value);
}

// Simple email regex conforming to common standards
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Standard phone/whatsapp pattern allowing +, numbers, spaces, parens, hyphens
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,25}$/;

// Project ID pattern matching PROJ-123 or other typical alphanumeric IDs
const PROJECT_ID_REGEX = /^[a-zA-Z0-9\-]{5,100}$/;

// Base64 regex pattern
const BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export function validatePayload(payload: any, schema: Schema): { field: string; message: string }[] {
  const errors: { field: string; message: string }[] = [];

  if (payload === null || typeof payload !== "object") {
    errors.push({ field: "payload", message: "Request payload must be a valid JSON object." });
    return errors;
  }

  // Check for unexpected keys at the root level (Strict Mode / No unexpected keys)
  for (const key of Object.keys(payload)) {
    if (!schema[key]) {
      errors.push({ field: key, message: `Unexpected property '${key}' is not allowed.` });
    }
  }

  for (const [field, rule] of Object.entries(schema)) {
    const value = payload[field];

    // Check required
    if (value === undefined || value === null) {
      if (rule.required) {
        errors.push({ field, message: `Field '${field}' is required.` });
      }
      continue;
    }

    // Check type
    if (rule.type === "array") {
      if (!Array.isArray(value)) {
        errors.push({ field, message: `Field '${field}' must be an array.` });
        continue;
      }
    } else {
      if (typeof value !== rule.type) {
        errors.push({ field, message: `Field '${field}' must be of type ${rule.type}.` });
        continue;
      }
    }

    // String validation
    if (rule.type === "string") {
      const strVal = value as string;

      if (!rule.allowEmpty && strVal.trim() === "") {
        errors.push({ field, message: `Field '${field}' cannot be empty.` });
        continue;
      }

      if (rule.max !== undefined && strVal.length > rule.max) {
        errors.push({ field, message: `Field '${field}' exceeds maximum length of ${rule.max} characters.` });
        continue;
      }

      if (rule.min !== undefined && strVal.length < rule.min) {
        errors.push({ field, message: `Field '${field}' is below minimum length of ${rule.min} characters.` });
        continue;
      }

      // Check for generic XSS/SQL Injection strings
      if (containsMaliciousPayload(strVal)) {
        errors.push({ field, message: `Field '${field}' contains forbidden characters or scripts.` });
        continue;
      }

      if (rule.isEmail && !EMAIL_REGEX.test(strVal)) {
        errors.push({ field, message: `Field '${field}' is not a valid email address.` });
        continue;
      }

      if (rule.isPhone && !PHONE_REGEX.test(strVal)) {
        errors.push({ field, message: `Field '${field}' must be a valid phone number.` });
        continue;
      }

      if (rule.isProjectId && !PROJECT_ID_REGEX.test(strVal)) {
        errors.push({ field, message: `Field '${field}' must be a valid Project ID.` });
        continue;
      }

      if (rule.isBase64) {
        // Strip out base64 data header if present before validation
        const cleanBase64 = strVal.includes(",") ? strVal.split(",")[1] : strVal;
        if (!BASE64_REGEX.test(cleanBase64)) {
          errors.push({ field, message: `Field '${field}' must be a valid base64 encoded string.` });
          continue;
        }
      }

      if (rule.pattern && !rule.pattern.test(strVal)) {
        errors.push({ field, message: `Field '${field}' has an invalid format.` });
        continue;
      }
    }

    // Number validation
    if (rule.type === "number") {
      const numVal = value as number;
      if (isNaN(numVal)) {
        errors.push({ field, message: `Field '${field}' must be a valid number.` });
        continue;
      }

      if (rule.max !== undefined && numVal > rule.max) {
        errors.push({ field, message: `Field '${field}' exceeds maximum value of ${rule.max}.` });
        continue;
      }

      if (rule.min !== undefined && numVal < rule.min) {
        errors.push({ field, message: `Field '${field}' is below minimum value of ${rule.min}.` });
        continue;
      }
    }

    // Array validation
    if (rule.type === "array") {
      const arrVal = value as any[];

      if (rule.max !== undefined && arrVal.length > rule.max) {
        errors.push({ field, message: `Field '${field}' exceeds maximum array size of ${rule.max} items.` });
        continue;
      }

      if (rule.itemsType === "string") {
        for (let i = 0; i < arrVal.length; i++) {
          if (typeof arrVal[i] !== "string") {
            errors.push({ field, message: `Item at index ${i} in field '${field}' must be a string.` });
          } else if (containsMaliciousPayload(arrVal[i])) {
            errors.push({ field, message: `Item at index ${i} in field '${field}' contains forbidden scripts.` });
          } else if (arrVal[i].length > 200) {
            errors.push({ field, message: `Item at index ${i} in field '${field}' exceeds maximum length of 200 characters.` });
          }
        }
      }
    }

    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({ field, message: `Field '${field}' must be one of: ${rule.allowedValues.join(", ")}.` });
      continue;
    }
  }

  return errors;
}

// Middleware generator for body validation
export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    const reqId = (req as any).reqId || "N/A";

    if (hasPrototypePollution(req.body)) {
      logger.warn("Blocking request due to detected prototype pollution attempt", { reqId, url: req.url });
      return res.status(400).json({
        success: false,
        error: "Malformed request payload detected (Prototype Pollution attempt).",
        reqId
      });
    }

    const errors = validatePayload(req.body, schema);
    if (errors.length > 0) {
      logger.warn(`Validation failed for request body on ${req.method} ${req.url}`, { reqId, errors });
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
        reqId
      });
    }

    next();
  };
}

// Middleware generator for query parameter validation
export function validateQuery(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent || req.timedOut || req.clientDisconnected) return;
    const reqId = (req as any).reqId || "N/A";

    if (hasPrototypePollution(req.query)) {
      logger.warn("Blocking request due to detected prototype pollution in query string", { reqId, url: req.url });
      return res.status(400).json({
        success: false,
        error: "Malformed request parameters detected.",
        reqId
      });
    }

    const errors = validatePayload(req.query, schema);
    if (errors.length > 0) {
      logger.warn(`Validation failed for query params on ${req.method} ${req.url}`, { reqId, errors });
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
        reqId
      });
    }

    next();
  };
}

// Middleware for validating route parameter :id (Project ID)
export function validateProjectIdParam(req: Request, res: Response, next: NextFunction) {
  if (res.headersSent || req.timedOut || req.clientDisconnected) return;
  const reqId = (req as any).reqId || "N/A";
  const { id } = req.params;

  if (hasPrototypePollution(req.params)) {
    logger.warn("Blocking request due to detected prototype pollution in route params", { reqId, url: req.url });
    return res.status(400).json({
      success: false,
      error: "Malformed request parameters detected.",
      reqId
    });
  }

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Project ID parameter is missing.",
      reqId
    });
  }

  if (containsMaliciousPayload(id) || !PROJECT_ID_REGEX.test(id)) {
    logger.warn(`Blocked invalid or malicious Project ID parameter: '${id}'`, { reqId, url: req.url });
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: [
        {
          field: "id",
          message: "Field 'id' must be a valid Project ID."
        }
      ],
      reqId
    });
  }

  next();
}

// Schemas for the endpoints

// 1. POST /api/projects
export const createProjectSchema: Schema = {
  ownerName: { type: "string", required: true, max: 200 },
  businessName: { type: "string", required: true, max: 200 },
  email: { type: "string", required: true, max: 150, isEmail: true },
  whatsapp: { type: "string", required: true, max: 50, isPhone: true },
  packageId: { type: "string", required: false, max: 50, allowedValues: ["foundation", "growth", "dominance", ""] },
  ownership: { type: "string", required: false, max: 50, allowEmpty: true },
  industry: { type: "string", required: false, max: 200, allowEmpty: true },
  customIndustry: { type: "string", required: false, max: 500, allowEmpty: true },
  goal: { type: "string", required: false, max: 500, allowEmpty: true },
  customGoal: { type: "string", required: false, max: 1000, allowEmpty: true },
  hasDomain: { type: "string", required: false, max: 100, allowEmpty: true },
  hasLogo: { type: "string", required: false, max: 100, allowEmpty: true },
  contentReady: { type: "string", required: false, max: 100, allowEmpty: true },
  userId: { type: "string", required: false, max: 100, allowEmpty: true },
  aiPrompt: { type: "string", required: false, max: 1000, allowEmpty: true }
};

// 2. GET /api/projects (Query params)
export const getProjectsQuerySchema: Schema = {
  userId: { type: "string", required: false, max: 100, allowEmpty: true },
  email: { type: "string", required: false, max: 150, allowEmpty: true }
};

// 3. POST /api/auth/signup & login
export const authSchema: Schema = {
  email: { type: "string", required: true, max: 150, isEmail: true },
  password: { type: "string", required: true, min: 6, max: 100 },
  fullName: { type: "string", required: false, max: 200, allowEmpty: true },
  businessName: { type: "string", required: false, max: 200, allowEmpty: true }
};

// 4. PUT /api/projects/:id
export const updateProjectSchema: Schema = {
  ownerName: { type: "string", required: false, max: 200, allowEmpty: true },
  businessName: { type: "string", required: false, max: 200, allowEmpty: true },
  email: { type: "string", required: false, max: 150, isEmail: true },
  whatsapp: { type: "string", required: false, max: 50, isPhone: true },
  packageId: { type: "string", required: false, max: 50, allowEmpty: true },
  ownership: { type: "string", required: false, max: 50, allowEmpty: true },
  industry: { type: "string", required: false, max: 200, allowEmpty: true },
  customIndustry: { type: "string", required: false, max: 500, allowEmpty: true },
  goal: { type: "string", required: false, max: 500, allowEmpty: true },
  customGoal: { type: "string", required: false, max: 1000, allowEmpty: true },
  hasDomain: { type: "string", required: false, max: 100, allowEmpty: true },
  hasLogo: { type: "string", required: false, max: 100, allowEmpty: true },
  contentReady: { type: "string", required: false, max: 100, allowEmpty: true },
  userId: { type: "string", required: false, max: 100, allowEmpty: true },
  status: { type: "string", required: false, max: 50, allowEmpty: true },
  activeSection: { type: "string", required: false, max: 50, allowEmpty: true },
  domainName: { type: "string", required: false, max: 255, allowEmpty: true },
  logoUrl: { type: "string", required: false, max: 500, allowEmpty: true },
  contentReadyUrl: { type: "string", required: false, max: 500, allowEmpty: true },
  notes: { type: "string", required: false, max: 5000, allowEmpty: true },
  clientName: { type: "string", required: false, max: 200, allowEmpty: true },
  selectedPackage: { type: "string", required: false, max: 50, allowEmpty: true },
  ownershipChoice: { type: "string", required: false, max: 50, allowEmpty: true },
  paymentStatus: { type: "string", required: false, max: 50, allowedValues: ["paid", "unpaid", ""] },
  portalAccess: { type: "boolean", required: false },
  portalAccessSource: { type: "string", required: false, max: 50, allowEmpty: true },
  paymentId: { type: "string", required: false, max: 100, allowEmpty: true },
  orderId: { type: "string", required: false, max: 100, allowEmpty: true },
  paymentProvider: { type: "string", required: false, max: 50, allowEmpty: true },
  purchaseDate: { type: "string", required: false, max: 100, allowEmpty: true },
  purchasedPlan: { type: "string", required: false, max: 100, allowEmpty: true }
};

// 5. POST /api/projects/:id/quote
export const saveQuoteSchema: Schema = {
  packageName: { type: "string", required: true, max: 100 },
  price: { type: "number", required: true, min: 0, max: 1000000 },
  discount: { type: "number", required: false, min: 0, max: 1000000 },
  features: { type: "array", required: false, max: 50, itemsType: "string" },
  summary: { type: "string", required: false, max: 2000, allowEmpty: true }
};

// 6. POST /api/projects/:id/razorpay-order
export const createOrderSchema: Schema = {
  term: { type: "string", required: true, allowedValues: ["milestone", "upfront"] }
};

// 7. POST /api/projects/:id/verify-payment
export const verifyPaymentSchema: Schema = {
  razorpay_order_id: { type: "string", required: true, max: 100 },
  razorpay_payment_id: { type: "string", required: true, max: 100 },
  razorpay_signature: { type: "string", required: true, max: 256 },
  term: { type: "string", required: false, allowedValues: ["milestone", "upfront", ""] }
};

// 8. POST /api/projects/:id/upload
export const uploadAssetSchema: Schema = {
  name: { type: "string", required: true, max: 200 },
  type: { type: "string", required: true, max: 100 },
  size: { type: "number", required: false },
  content: { type: "string", required: true, isBase64: true }
};

// 9. POST /api/admin/verify
export const adminVerifySchema: Schema = {
  password: { type: "string", required: true, max: 100 }
};

// 10. POST /api/recommendation
export const recommendationSchema: Schema = {
  businessName: { type: "string", required: false, max: 200, allowEmpty: true },
  ownerName: { type: "string", required: false, max: 200, allowEmpty: true },
  targetAudience: { type: "string", required: false, max: 500, allowEmpty: true },
  businessPainPoint: { type: "string", required: false, max: 1000, allowEmpty: true },
  uniqueAdvantage: { type: "string", required: false, max: 1000, allowEmpty: true },
  brandTone: { type: "string", required: false, max: 100, allowEmpty: true },
  brandColors: { type: "string", required: false, max: 200, allowEmpty: true },
  needsBooking: { type: "boolean", required: false },
  needsReviews: { type: "boolean", required: false },
  needsPortfolioGrid: { type: "boolean", required: false },
  needsProducts: { type: "boolean", required: false }
};

// 11. POST /api/start-project/package-upgrade-options
export const packageUpgradeSchema: Schema = {
  packageId: { type: "string", required: true, allowedValues: ["foundation", "growth", "dominance"] },
  businessName: { type: "string", required: false, max: 200, allowEmpty: true },
  ownerName: { type: "string", required: false, max: 200, allowEmpty: true },
  industry: { type: "string", required: false, max: 200, allowEmpty: true },
  goal: { type: "string", required: false, max: 500, allowEmpty: true },
  aiPrompt: { type: "string", required: false, max: 1000, allowEmpty: true }
};
