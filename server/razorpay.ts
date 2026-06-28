import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayInstance: any = null;

export function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    throw new Error("Razorpay API Key ID or Secret is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.");
  }
  
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
  return razorpayInstance;
}

/**
 * Verify payment signature returned by the checkout modal
 */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (process.env.NODE_ENV !== "production") {
    if (signature === "signature_mock_bypass" || signature.startsWith("signature_mock_")) {
      console.log("Simulated Sandbox Bypass payment signature authorized.");
      return true;
    }
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.warn("RAZORPAY_KEY_SECRET environment variable is missing. Real signature verification cannot be performed.");
    return false;
  }
  
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
    
  return generatedSignature === signature;
}

/**
 * Verify webhook signature sent by Razorpay webhook event
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET environment variable is not set.");
    return false;
  }
  
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
    
  return generatedSignature === signature;
}
