import type { WebsiteAuditLead } from "@prisma/client";
import { logger } from "../config/logger";

export interface WebsiteAuditLeadNotifier {
  notifyNewWebsiteAuditLead(lead: WebsiteAuditLead): Promise<"sent" | "disabled">;
}

function isQualifiedLead(lead: WebsiteAuditLead) {
  return lead.budgetRange !== "Not sure yet";
}

function formatLeadEmail(lead: WebsiteAuditLead) {
  return [
    "New Website Audit Lead",
    "",
    `Name: ${lead.firstName} ${lead.lastName}`,
    `Company: ${lead.company}`,
    `Work Email: ${lead.workEmail}`,
    `Website: ${lead.websiteUrl}`,
    `Budget: ${lead.budgetRange}`,
    `Launch Timeline: ${lead.launchTimeline}`,
    "",
    `Company Description: ${lead.companyDescription}`,
    "",
    `Website Problem: ${lead.websiteProblem}`,
    "",
    `Lead Status: ${lead.status}`,
    `Submitted: ${lead.createdAt.toISOString()}`,
  ].join("\n");
}

export class WebsiteAuditNotificationService implements WebsiteAuditLeadNotifier {
  private hasLoggedDisabled = false;

  async notifyNewWebsiteAuditLead(lead: WebsiteAuditLead) {
    const recipient = process.env.WEBSITE_AUDIT_NOTIFICATION_EMAIL?.trim();
    const from = process.env.EMAIL_FROM?.trim();
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!recipient || !from || !apiKey) {
      if (!this.hasLoggedDisabled) {
        this.hasLoggedDisabled = true;
        logger.info("Website audit notification delivery is disabled: Resend configuration is incomplete");
      }
      return "disabled";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    timeout.unref();

    try {
      const subjectPrefix = isQualifiedLead(lead) ? "[HIGH INTENT] " : "";
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject: `${subjectPrefix}New CloudSight Website Audit Lead — ${lead.company}`,
          text: formatLeadEmail(lead),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Resend notification request failed with status ${response.status}`);
      }

      return "sent";
    } finally {
      clearTimeout(timeout);
    }
  }
}

let websiteAuditLeadNotifier: WebsiteAuditLeadNotifier = new WebsiteAuditNotificationService();

export function getWebsiteAuditLeadNotifier() {
  return websiteAuditLeadNotifier;
}

/** Test seam; production code always uses the configured notification service. */
export function setWebsiteAuditLeadNotifierForTesting(notifier: WebsiteAuditLeadNotifier) {
  websiteAuditLeadNotifier = notifier;
}

export function resetWebsiteAuditLeadNotifierForTesting() {
  websiteAuditLeadNotifier = new WebsiteAuditNotificationService();
}
