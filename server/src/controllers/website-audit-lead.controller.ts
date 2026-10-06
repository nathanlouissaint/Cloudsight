import type { Request, Response } from "express";
import { logger } from "../config/logger";
import { websiteAuditLeadContract } from "../contracts/website-audit-lead.contract";
import { createWebsiteAuditLead } from "../services/website-audit-lead.service";
import { getWebsiteAuditLeadNotifier } from "../services/website-audit-notification.service";

export async function createWebsiteAuditLeadRequest(req: Request, res: Response) {
  const parsed = websiteAuditLeadContract.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: parsed.error.issues[0]?.message ?? "Invalid website audit request.",
    });
  }

  if (parsed.data.honeypot.trim()) {
    logger.warn({ ip: req.ip }, "Rejected website audit honeypot submission");
    return res.status(400).json({ message: "Unable to accept this request." });
  }

  const { honeypot: _honeypot, ...leadInput } = parsed.data;

  try {
    const lead = await createWebsiteAuditLead(leadInput);
    logger.info({ leadId: lead.leadId, duplicate: lead.duplicate }, "Website audit lead persisted");

    if (!lead.duplicate && lead.lead) {
      try {
        const delivery = await getWebsiteAuditLeadNotifier().notifyNewWebsiteAuditLead(lead.lead);
        if (delivery === "sent") {
          logger.info({ leadId: lead.leadId }, "Website audit notification sent");
        }
      } catch (notificationError) {
        logger.error({ err: notificationError, leadId: lead.leadId }, "Website audit notification failed");
      }
    }

    return res.status(lead.duplicate ? 200 : 201).json({
      success: true,
      leadId: lead.leadId,
      message: "Website audit request received.",
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to capture website audit lead");
    return res.status(500).json({ message: "Unable to receive your request. Please try again." });
  }
}
