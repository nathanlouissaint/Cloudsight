import crypto from "node:crypto";
import { WebsiteAuditJobStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuditFetchError, fetchAuditHtml, validateAuditUrl } from "./website-audit-url-security.service";
import { extractHomepageEvidence } from "./website-audit-extractor.service";

function tokenHash(token: string) {
  const secret = process.env.WEBSITE_AUDIT_TOKEN_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "development-only-secret");
  if (!secret) throw new Error("WEBSITE_AUDIT_TOKEN_SECRET is required in production.");
  return crypto.createHash("sha256").update(`${secret}:${token}`).digest("hex");
}
const maxRetries = 2;

export async function createAuditJob(submittedUrl: string, leadId?: string) {
  const { url } = await validateAuditUrl(submittedUrl);
  const token = crypto.randomBytes(32).toString("base64url");
  const recent = await prisma.websiteAuditJob.findFirst({ where: { normalizedUrl: url.toString(), status: { in: [WebsiteAuditJobStatus.PENDING, WebsiteAuditJobStatus.PROCESSING] }, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } }, orderBy: { createdAt: "desc" } });
  if (recent) return { job: recent, token: null, duplicate: true };
  const job = await prisma.websiteAuditJob.create({ data: { submittedUrl, normalizedUrl: url.toString(), reportTokenHash: tokenHash(token), leadId } });
  return { job, token, duplicate: false };
}

export async function getAuditByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) return null;
  return prisma.websiteAuditJob.findUnique({ where: { reportTokenHash: tokenHash(token) }, include: { report: true } });
}

export async function recoverInterruptedAuditJobs() {
  await prisma.websiteAuditJob.updateMany({ where: { status: WebsiteAuditJobStatus.PROCESSING, startedAt: { lt: new Date(Date.now() - 10 * 60_000) } }, data: { status: WebsiteAuditJobStatus.PENDING, failureReason: "WORKER_INTERRUPTED", startedAt: null } });
}

export async function processNextAuditJob() {
  const candidate = await prisma.websiteAuditJob.findFirst({ where: { status: WebsiteAuditJobStatus.PENDING }, orderBy: { createdAt: "asc" } });
  if (!candidate) return false;
  const claim = await prisma.websiteAuditJob.updateMany({ where: { id: candidate.id, status: WebsiteAuditJobStatus.PENDING }, data: { status: WebsiteAuditJobStatus.PROCESSING, startedAt: new Date() } });
  if (!claim.count) return false;
  try {
    const fetched = await fetchAuditHtml(candidate.normalizedUrl);
    const evidence = extractHomepageEvidence(fetched.html, fetched.finalUrl);
    await prisma.$transaction([prisma.websiteAuditReport.create({ data: { auditJobId: candidate.id, auditedUrl: fetched.finalUrl, metadata: evidence.metadata, findings: evidence.findings } }), prisma.websiteAuditJob.update({ where: { id: candidate.id }, data: { status: WebsiteAuditJobStatus.COMPLETED, completedAt: new Date(), failureReason: null } })]);
  } catch (error) {
    const code = error instanceof AuditFetchError ? error.code : "PROCESSING_FAILED";
    const retry = candidate.retryCount + 1;
    await prisma.websiteAuditJob.update({ where: { id: candidate.id }, data: retry <= maxRetries && code !== "CRAWLER_NETWORK_ISOLATION_REQUIRED" ? { status: WebsiteAuditJobStatus.PENDING, retryCount: retry, failureReason: code, startedAt: null } : { status: WebsiteAuditJobStatus.FAILED, retryCount: retry, failureReason: code, completedAt: new Date() } });
  }
  return true;
}

let timer: NodeJS.Timeout | null = null;
export async function startWebsiteAuditWorker() { await recoverInterruptedAuditJobs(); if (!timer) timer = setInterval(() => { void processNextAuditJob(); }, 1_000); }
export function stopWebsiteAuditWorker() { if (timer) clearInterval(timer); timer = null; }
