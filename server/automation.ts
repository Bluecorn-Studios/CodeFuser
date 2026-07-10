import { getSupabase } from "./supabase.js";
import { sendEmailAsync } from "./email.js";
import { getProjectById, updateProject, logAuditEvent } from "./db.js";
import { getExtraData } from "./extra_store.js";

// Admin Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "onboarding@resend.dev";
const DEV_APP_URL = process.env.DEV_APP_URL || "http://localhost:3000";

/**
 * Interface representing the automation flags saved inside a quote object
 */
export interface AutomationFlags {
  paymentReminderSent?: boolean;
  expiryReminderSent?: boolean;
  expiredReminderSent?: boolean;
}

/**
 * 1. PREMIUM HTML TEMPLATE: Internal Admin Notifications
 */
export function getAdminNotificationTemplate(subject: string, message: string, details: Record<string, string>): string {
  const detailRows = Object.entries(details)
    .map(([key, val]) => `
      <div class="detail-row" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
        <span style="color: #71717a; font-weight: 500; font-family: monospace;">${key}:</span>
        <span style="color: #f4f4f5; font-weight: 600; font-family: monospace; text-align: right;">${val}</span>
      </div>
    `).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; }
        .header { background-color: #1c1917; padding: 24px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 16px; font-weight: bold; letter-spacing: 0.1em; color: #f59e0b; font-family: monospace; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; font-family: monospace; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
        .details-box { background-color: #0d0d0e; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .footer { background-color: #1c1917; padding: 20px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER INTERNAL SYSTEM ALERT</div>
        </div>
        <div class="content">
          <h1>${subject}</h1>
          <p>${message}</p>
          
          <div class="details-box">
            ${detailRows}
          </div>
        </div>
        <div class="footer">
          System Automated Inbound Notification | Confidential Admin Log
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 2. PREMIUM HTML TEMPLATE: Milestone Status Progress Updates
 */
export function getMilestoneStatusUpdateTemplate(
  clientName: string,
  businessName: string,
  previousStatus: string,
  newStatus: string,
  portalUrl: string
): string {
  // Select description and next steps based on new status
  let statusDescription = "Your project state has been transitioned by our engineering administration team.";
  let actionCall = "We are currently compiling and baselining your files.";
  let nextSteps = "No immediate action is required from your end. You can review live developments in your dashboard.";

  if (newStatus === "Design Phase") {
    statusDescription = "Your project is now officially entering the wireframe and design architecture stage.";
    actionCall = "Our designer squad is actively sketching system components, user journeys, and branding schemes.";
    nextSteps = "Please log in to your Client Portal to review design wireframes as they are posted, or upload style guides.";
  } else if (newStatus === "Development Phase") {
    statusDescription = "Exciting milestone! Your approved designs are now moving into active code compilation.";
    actionCall = "Our core engineering compiler is building the secure database, backend REST APIs, and responsive React layout.";
    nextSteps = "We are proceeding with local integration tests. Keep an eye on your portal dashboard to monitor live status updates.";
  } else if (newStatus === "Testing") {
    statusDescription = "Your compiled code is entering our rigorous, automated Quality Assurance (QA) pipeline.";
    actionCall = "We are running performance stress tests, boundary validations, and responsive client layout audits.";
    nextSteps = "Our team will compile the final diagnostic report soon. Feel free to log in and preview sandbox environments.";
  } else if (newStatus === "Checklist Ready" || newStatus === "Ready" || newStatus === "Deliverables Ready") {
    statusDescription = "Fulfillment complete! Your customized digital system and launch assets are fully compiled and verified.";
    actionCall = "We have locked and bundled your production-ready build files, database schemas, and documentation manual.";
    nextSteps = "ACTION REQUIRED: Please enter your Client Portal immediately to download high-resolution assets and review your launch checklist.";
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Update - ${businessName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
        .milestone-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .milestone-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .milestone-label { color: #71717a; font-weight: 500; }
        .milestone-val { color: #f4f4f5; font-weight: 600; text-transform: uppercase; }
        .active-val { color: #f59e0b; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #27272a; color: #ffffff !important; border: 1px solid #3f3f46; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 24px; border-radius: 8px; transition: background-color 0.2s; }
        .btn:hover { background-color: #3f3f46; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER DEVELOPMENT HUB</div>
        </div>
        <div class="content">
          <h1>Milestone Progress Update</h1>
          <p>Hi ${clientName},</p>
          <p>We are pleased to report a milestone update for <strong>${businessName}</strong>. Your project has successfully progressed through our development pipeline.</p>
          
          <div class="milestone-box">
            <div class="milestone-row">
              <span class="milestone-label">Previous Milestone:</span>
              <span class="milestone-val" style="text-decoration: line-through; color: #52525b;">${previousStatus}</span>
            </div>
            <div class="milestone-row">
              <span class="milestone-label">Current Milestone:</span>
              <span class="milestone-val active-val">${newStatus}</span>
            </div>
          </div>

          <p><strong>Status Detail:</strong> ${statusDescription} ${actionCall}</p>
          <p><strong>What happens next:</strong> ${nextSteps}</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Monitor Live Roadmap</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Real-time Project Compiler Tracking.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 3. PREMIUM HTML TEMPLATE: Pending Payment Reminder
 */
export function getPendingPaymentReminderTemplate(
  clientName: string,
  businessName: string,
  packageName: string,
  portalUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Pending - ${businessName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; color: #d97706; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
        .highlight-box { background-color: #1c1917; border-left: 4px solid #d97706; border-radius: 0 8px 8px 0; padding: 16px; margin-bottom: 24px; }
        .highlight-text { color: #f4f4f5; font-size: 13px; font-weight: 500; margin: 0; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER TRANSACTION REMINDER</div>
        </div>
        <div class="content">
          <h1>Secure Your Project Resources</h1>
          <p>Hi ${clientName},</p>
          <p>We recently received your custom business diagnostics and specifications for <strong>${businessName}</strong>, selecting the premium <strong>${packageName.toUpperCase()}</strong> tier.</p>
          
          <div class="highlight-box">
            <p class="highlight-text">Your proposal baseline is locked, but we are holding development resources until the initial financial milestone is secured. Standard queue allocation is expiring soon.</p>
          </div>

          <p>You can seamlessly lock in your pricing structure and trigger active development by selecting your preferred payment term (flexible milestones or discounted upfront) in your customized dashboard.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Proceed to Secure Checkout</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Transaction Security Operations.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 4. PREMIUM HTML TEMPLATE: Proposal Expiring Alert
 */
export function getProposalExpiringTemplate(
  clientName: string,
  businessName: string,
  packageName: string,
  expiryDate: string,
  portalUrl: string
): string {
  const formattedExpiry = new Date(expiryDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Action Required: Proposal Expiring</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; color: #ea580c; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
        .alert-box { background-color: #1c1917; border: 1px dashed #ea580c; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center; }
        .expiry-date { font-size: 15px; font-weight: bold; color: #ea580c; font-family: monospace; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #ea580c; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER PROPOSAL WARNING</div>
        </div>
        <div class="content">
          <h1>Proposal Pricing Freeze Expiring Soon</h1>
          <p>Hi ${clientName},</p>
          <p>This is an automated system notification that your official pricing quote and custom baseline recommendation for <strong>${businessName}</strong> (${packageName}) is expiring in less than 24 hours.</p>
          
          <div class="alert-box">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #71717a; text-transform: uppercase; tracking-wider: 0.05em;">Guaranteed pricing expiration date:</p>
            <span class="expiry-date">${formattedExpiry}</span>
          </div>

          <p>To lock in the negotiated package discounts and prevent your baseline configuration from being unlocked, please log into your client hub and complete checkout before the deadline.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Secure Frozen Price Quote</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Commercial Operations Hub.
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * 5. PREMIUM HTML TEMPLATE: Proposal Expired Notice
 */
export function getProposalExpiredTemplate(
  clientName: string,
  businessName: string,
  packageName: string,
  portalUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notice: Price Quote Expired</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 20px; font-weight: bold; letter-spacing: 0.05em; color: #71717a; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 18px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; font-size: 14px; }
        .info-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #27272a; color: #ffffff !important; border: 1px solid #3f3f46; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 24px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 11px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER COMMERCIAL OPERATIONS</div>
        </div>
        <div class="content">
          <h1>Guaranteed Quote Pricing Expired</h1>
          <p>Hi ${clientName},</p>
          <p>Your locked pricing agreement and custom-crafted recommendation for <strong>${businessName}</strong> (${packageName}) has officially expired.</p>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 13px; color: #a1a1aa;">The guaranteed price freeze has been unlocked. Your specs remain registered, but quotes are now subject to regular pricing adjustments.</p>
          </div>

          <p>If you are still interested in compiling your system under the negotiated framework, please access your Client Portal to generate a fresh diagnostic baseline request or consult with our team.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Enter Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Commercial Operations Hub.
        </div>
      </div>
    </body>
    </html>
  `;
}


/**
 * TRIGGER: Asynchronous Status-Change Follow-up Workflows
 * Sends a milestone notification to the client and logs the outcome in the Audit Trail.
 */
export async function triggerStatusChangeAutomation(
  projectId: string,
  previousStatus: string,
  newStatus: string,
  requestId: string = "N/A"
): Promise<void> {
  // Execute asynchronously inside a detached thread context to never block the main request/payment pipeline
  Promise.resolve().then(async () => {
    try {
      console.log(`[Automation] Routing status-change workflow for project ${projectId} (${previousStatus} -> ${newStatus})`);
      const project = await getProjectById(projectId);
      if (!project) return;

      // Do not send if no transition actually occurred or values match
      if (previousStatus === newStatus) return;

      const portalUrl = `${DEV_APP_URL}/login`;
      const emailHtml = getMilestoneStatusUpdateTemplate(
        project.clientName,
        project.businessName,
        previousStatus,
        newStatus,
        portalUrl
      );

      // Send email asynchronously
      sendEmailAsync(
        project.email,
        `Project Progress Notification: ${project.businessName} has entered ${newStatus}`,
        emailHtml
      );

      // Track the milestone update event in the Audit Trail
      await logAuditEvent({
        projectId,
        eventType: "Milestone Automated Alert",
        requestId,
        actor: "System",
        status: "Success",
        notes: `Asynchronous progress email routed to client. Entered stage: ${newStatus}`
      });

    } catch (err: any) {
      console.error(`[Automation Error] Failed executing status change workflow for ${projectId}:`, err);
    }
  });
}

/**
 * TRIGGER: Asynchronous Admin Internal Alerts
 * Dispatches an automated system notification to the admin dashboard email address.
 */
export function triggerAdminNotification(
  subject: string,
  message: string,
  details: Record<string, string>,
  requestId: string = "N/A"
): void {
  // Execute asynchronously
  Promise.resolve().then(() => {
    try {
      console.log(`[Automation] Dispatching administrative internal alert: ${subject}`);
      const emailHtml = getAdminNotificationTemplate(subject, message, details);
      
      sendEmailAsync(
        ADMIN_EMAIL,
        `[Admin Notification] ${subject}`,
        emailHtml
      );
    } catch (err: any) {
      console.error(`[Automation Error] Failed executing admin notification:`, err);
    }
  });
}

/**
 * PERIODIC SCANNER: Runs commercial automation rules based on project state and dates.
 * This runs asynchronously, is retry-safe, and enforces strict idempotency using automationFlags.
 */
export async function runPeriodicAutomationScan(requestId: string = "scan-auto"): Promise<Record<string, number>> {
  const supabase = getSupabase();
  const stats = {
    paymentRemindersSent: 0,
    quoteExpiryWarningsSent: 0,
    quoteExpiredNotificationsSent: 0,
    projectsScanned: 0
  };

  try {
    console.log(`[Automation Engine] Initiating asynchronous background scan... Request ID: ${requestId}`);
    
    // Fetch all active projects
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*");

    if (error || !projects) {
      throw new Error(`Failed to retrieve project directory for scan: ${error?.message}`);
    }

    stats.projectsScanned = projects.length;
    const portalUrl = `${DEV_APP_URL}/login`;

    for (const item of projects) {
      const projectId = item.id;
      const clientName = item.client_name || "";
      const businessName = item.business_name || "";
      const email = item.email || "";
      const paymentStatus = item.payment_status || "unpaid";
      const timestamp = item.timestamp;
      const selectedPackage = item.selected_package || "growth";
      
      // Get detailed quote field
      const quote = item.quote || null;
      const flags: AutomationFlags = quote?.automationFlags || {};

      // RULE 1: Pending Payment Follow-ups
      // Trigger if unpaid, registered > 3 days ago (72 hours), and paymentReminderSent has not been fired yet.
      if (paymentStatus === "unpaid") {
        const creationDate = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - creationDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays >= 3 && !flags.paymentReminderSent) {
          console.log(`[Automation Rule] Project ${projectId} (${businessName}) qualifies for Unpaid Payment Reminder.`);
          
          const emailHtml = getPendingPaymentReminderTemplate(
            clientName,
            businessName,
            selectedPackage,
            portalUrl
          );

          // Route email
          sendEmailAsync(email, `CodeFuser Project Pending - Secure Checkout for ${businessName}`, emailHtml);

          // Update project automation flags in database to enforce idempotency / retry safety
          const updatedFlags = { ...flags, paymentReminderSent: true };
          const updatedQuote = quote ? { ...quote, automationFlags: updatedFlags } : { packageName: selectedPackage, price: 24999, discount: 0, features: [], summary: "Standard package draft.", timestamp, expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: "active", automationFlags: updatedFlags };

          await supabase
            .from("projects")
            .update({ quote: updatedQuote })
            .eq("id", projectId);

          // Log to audit trail
          await logAuditEvent({
            projectId,
            eventType: "Payment Reminder Sent",
            requestId,
            actor: "System",
            status: "Success",
            notes: `Automated pending payment follow-up email sent to client after ${diffDays.toFixed(1)} days.`
          });

          stats.paymentRemindersSent++;
        }
      }

      // RULE 2: Official Quote Pricing Warnings (Expiring and Expired)
      if (quote && quote.expiryDate) {
        const expiry = new Date(quote.expiryDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Sub-rule A: Proposal Expiring warning (within 24 hours of expiry, still active, reminder not sent yet)
        if (diffHours > 0 && diffHours <= 24 && !flags.expiryReminderSent && quote.status !== "expired") {
          console.log(`[Automation Rule] Project ${projectId} (${businessName}) qualifies for Proposal Expiring warning.`);

          const emailHtml = getProposalExpiringTemplate(
            clientName,
            businessName,
            quote.packageName || selectedPackage,
            quote.expiryDate,
            portalUrl
          );

          sendEmailAsync(email, `Action Required: Your CodeFuser Price Quote is expiring soon!`, emailHtml);

          // Persist automation flag
          const updatedFlags = { ...flags, expiryReminderSent: true };
          const updatedQuote = { ...quote, status: "expiring", automationFlags: updatedFlags };

          await supabase
            .from("projects")
            .update({ quote: updatedQuote })
            .eq("id", projectId);

          await logAuditEvent({
            projectId,
            eventType: "Proposal Warning Sent",
            requestId,
            actor: "System",
            status: "Success",
            notes: `Automated proposal expiring warning email routed. Quote expires in ${diffHours.toFixed(1)} hours.`
          });

          stats.quoteExpiryWarningsSent++;
        }

        // Sub-rule B: Proposal Expired notification (past expiry date, expired notice not sent yet)
        if (diffHours <= 0 && !flags.expiredReminderSent) {
          console.log(`[Automation Rule] Project ${projectId} (${businessName}) quote has expired. Dispatching alert.`);

          const emailHtml = getProposalExpiredTemplate(
            clientName,
            businessName,
            quote.packageName || selectedPackage,
            portalUrl
          );

          sendEmailAsync(email, `Notice: Your CodeFuser Price Quote has expired`, emailHtml);

          // Persist automation flag
          const updatedFlags = { ...flags, expiredReminderSent: true };
          const updatedQuote = { ...quote, status: "expired", automationFlags: updatedFlags };

          await supabase
            .from("projects")
            .update({ quote: updatedQuote })
            .eq("id", projectId);

          await logAuditEvent({
            projectId,
            eventType: "Proposal Expired Alert",
            requestId,
            actor: "System",
            status: "Success",
            notes: `Automated proposal expired notification email routed. Pricing agreement has been unlocked.`
          });

          stats.quoteExpiredNotificationsSent++;
        }
      }
    }

    console.log(`[Automation Engine] Background scan completed. Stats:`, stats);
  } catch (err: any) {
    console.error(`[Automation Engine Error] Periodic scan exception occurred:`, err.message || err);
  }

  return stats;
}

/**
 * INITIALIZATION SCHEDULER: Boots the background automation cron loop.
 * Runs once every 12 hours.
 */
export function initializeAutomationScheduler(): void {
  console.log("[Automation Engine] Initializing background commercial scanner scheduler...");
  
  // Run an initial scan after 10 seconds of startup to catch pending tasks immediately
  setTimeout(() => {
    runPeriodicAutomationScan("startup-scan").catch(err => {
      console.error("[Automation Scheduler] Initial startup scan failed:", err);
    });
  }, 10000);

  // Set interval to repeat every 12 hours
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  setInterval(() => {
    runPeriodicAutomationScan("interval-scan").catch(err => {
      console.error("[Automation Scheduler] Interval background scan failed:", err);
    });
  }, TWELVE_HOURS_MS);
}
