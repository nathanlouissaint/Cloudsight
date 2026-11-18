import { apiRequest } from "../api/client";

export interface WebsiteAuditLead {
  firstName: string;
  lastName: string;
  workEmail: string;
  company: string;
  websiteUrl: string;
  offering: string;
  websiteProblem: string;
  timeline: string;
  budget: string;
  honeypot: string;
}

/**
 * Intentionally isolated until a CRM, webhook, or CloudSight API endpoint is selected.
 * This preserves a single integration point and prevents form data from being silently lost.
 */
export async function submitWebsiteAuditLead(lead: WebsiteAuditLead) {
  return apiRequest<{ success: true; leadId: string; message: string }>(
    "/website-audit/leads",
    {
      method: "POST",
      skipAuthHeader: true,
      skipAuthRefresh: true,
      body: {
        firstName: lead.firstName, lastName: lead.lastName, workEmail: lead.workEmail,
        company: lead.company, websiteUrl: lead.websiteUrl,
        companyDescription: lead.offering, websiteProblem: lead.websiteProblem,
        ...(lead.timeline ? { launchTimeline: lead.timeline } : {}),
        ...(lead.budget ? { budgetRange: lead.budget } : {}),
        honeypot: lead.honeypot,
      },
    },
  );
}

export type WebsiteAuditJob = { status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"; auditedUrl: string; failureReason: string | null; report: { auditedUrl: string; metadata: { title: string | null; metaDescription: string | null; h1: string[]; h2: string[]; ctas: { text: string; href: string }[]; forms: { action: string | null; method: string; fields: string[] }[] }; findings: { category: string; evidence: string; source: string }[] } | null };
export async function startWebsiteAudit(websiteUrl: string, leadId: string) { return apiRequest<{ reportToken: string | null; status: WebsiteAuditJob["status"] }>("/website-audit/jobs", { method: "POST", skipAuthHeader: true, skipAuthRefresh: true, body: { websiteUrl, leadId } }); }
export async function getWebsiteAudit(token: string) { return apiRequest<WebsiteAuditJob>(`/website-audit/jobs/${token}`, { skipAuthHeader: true, skipAuthRefresh: true }); }
