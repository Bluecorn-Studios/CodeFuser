import { withRetry } from "./retry.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CodeFuser <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend Warning] RESEND_API_KEY is not configured in environment variables. Email transmission was bypassed.");
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || "CodeFuser <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Resend Success] Email sent successfully to ${to}. Message ID: ${data.id}`);
    return data;
  } catch (err: any) {
    console.error(`[Resend Failure] Failed to send email to ${to}:`, err.message || err);
    throw err;
  }
}

// Asynchronous wrapper to isolate email transmission and prevent any API errors from interrupting payment or project registration workflows
export function sendEmailAsync(to: string, subject: string, html: string) {
  sendEmail(to, subject, html).catch((err) => {
    console.error(`[Email Async Swallow] Suppressed email failure to protect execution pipeline:`, err);
  });
}

// Premium Email templates matching CodeFuser branding
export function getProjectCreatedTemplate(clientName: string, businessName: string, packageId: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CodeFuser</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER CORE</div>
        </div>
        <div class="content">
          <h1>Project Registration Confirmed</h1>
          <p>Hi ${clientName},</p>
          <p>Thank you for choosing CodeFuser. Your project proposal and diagnostic specs have been successfully compiled and registered in our system. Our engineering team is reviewing your requirements to establish the architectural baseline.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Business Name:</span>
              <span class="detail-val">${businessName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tier Selected:</span>
              <span class="detail-val" style="text-transform: uppercase;">${packageId}</span>
            </div>
          </div>

          <p>You can access your customized Client Portal at any time to monitor compiler progress, upload design assets, and view active deliverables once authorized.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Launch Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Confidential Client Communication.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentSuccessTemplate(clientName: string, businessName: string, planName: string, orderId: string, amount: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt Confirmed</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #10b981; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER PAYMENT VERIFIED</div>
        </div>
        <div class="content">
          <h1>Payment Receipt Confirmed</h1>
          <p>Hi ${clientName},</p>
          <p>Excellent news! We have successfully received and verified your payment. Your standard pricing is now locked and development resources have been allocated to your brand workspace.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Business Name:</span>
              <span class="detail-val">${businessName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Active Plan:</span>
              <span class="detail-val">${planName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Identifier:</span>
              <span class="detail-val">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-val">${amount}</span>
            </div>
          </div>

          <p>Your client portal is now fully activated! You can begin uploading design assets, logo source files, copy guidelines, and track the live dev roadmap immediately.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Enter Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Secure SSL Transmission Receipt.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPortalActivatedTemplate(clientName: string, businessName: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Client Portal Activated</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #3b82f6; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PORTAL AUTHORIZED</div>
        </div>
        <div class="content">
          <h1>Your Client Portal is Ready</h1>
          <p>Hi ${clientName},</p>
          <p>We are excited to inform you that your CodeFuser Client Portal has been fully authorized and activated by our team for <strong>${businessName}</strong>.</p>
          <p>You can now log in using your registered credentials to check on the real-time project milestone timeline, collaborate on system requirements, and retrieve your design and source-code deliverables safely.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Launch Dashboard</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Security Authorized Link.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getDeliverablesReadyTemplate(clientName: string, businessName: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deliverables Ready</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .highlight-box { background-color: #18181b; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px; margin-bottom: 24px; }
        .highlight-text { color: #f4f4f5; font-size: 14px; font-weight: 500; margin: 0; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #f59e0b; color: #18181b !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">DELIVERABLES ARE COMPILED</div>
        </div>
        <div class="content">
          <h1>Your Project Deliverables are Ready!</h1>
          <p>Hi ${clientName},</p>
          <p>We are thrilled to let you know that the deliverables for <strong>${businessName}</strong> are completed, tested, and ready for you to retrieve!</p>
          
          <div class="highlight-box">
            <p class="highlight-text">Your custom branding blueprints, structured databases, code bundles, and launch checklist are ready for download in the client hub.</p>
          </div>

          <p>Please enter your client portal to review the finished product, download high-resolution assets, and review your production deployment launch guide.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Download Deliverables</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Secure Assets Handover Communication.
        </div>
      </div>
    </body>
    </html>
  `;
}
