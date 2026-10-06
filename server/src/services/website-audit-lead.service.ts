import { prisma } from "../config/prisma";
import type { WebsiteAuditLeadInput } from "../contracts/website-audit-lead.contract";

const duplicateWindowMs = 10 * 60 * 1000;

export async function createWebsiteAuditLead(
  input: Omit<WebsiteAuditLeadInput, "honeypot">,
) {
  const recentLead = await prisma.websiteAuditLead.findFirst({
    where: {
      workEmail: input.workEmail,
      websiteUrl: input.websiteUrl,
      createdAt: { gte: new Date(Date.now() - duplicateWindowMs) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (recentLead) {
    return { leadId: recentLead.id, duplicate: true, lead: null };
  }

  const lead = await prisma.websiteAuditLead.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      workEmail: input.workEmail,
      company: input.company,
      websiteUrl: input.websiteUrl,
      companyDescription: input.companyDescription,
      websiteProblem: input.websiteProblem,
      launchTimeline: input.launchTimeline,
      budgetRange: input.budgetRange,
    },
  });

  return { leadId: lead.id, duplicate: false, lead };
}
