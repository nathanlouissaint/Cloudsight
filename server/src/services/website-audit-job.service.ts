import crypto from "node:crypto";
import { Prisma, WebsiteAuditJobStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuditFetchError, fetchAuditHtml, validateAuditUrl } from "./website-audit-url-security.service";
import { extractHomepageEvidence } from "./website-audit-extractor.service";
function tokenHash(token: string) {
  const secret = process.env.WEBSITE_AUDIT_TOKEN_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "development-only-secret");
  if (!secret) throw new Error("WEBSITE_AUDIT_TOKEN_SECRET is required in production.");
  return crypto.createHash("sha256").update(`${secret}:${token}`).digest("hex");
}
const maxRetries = 2;
const globalConcurrency = Number(process.env.WEBSITE_AUDIT_GLOBAL_CONCURRENCY ?? 2);
const domainConcurrency = Number(process.env.WEBSITE_AUDIT_DOMAIN_CONCURRENCY ?? 1);

export async function createAuditJob(submittedUrl: string, leadId?: string) {
  const { url } = await validateAuditUrl(submittedUrl);
  const token = crypto.randomBytes(32).toString("base64url");
  const recent = await prisma.websiteAuditJob.findFirst({ where: { normalizedUrl: url.toString(), status: { in: [WebsiteAuditJobStatus.PENDING, WebsiteAuditJobStatus.PROCESSING] }, createdAt: { gte: new Date(Date.now() - 10 * 60_000) } }, orderBy: { createdAt: "desc" } });
  if (recent) return { job: recent, token: null, duplicate: true };
  const job = await prisma.websiteAuditJob.create({ data: { submittedUrl, normalizedUrl: url.toString(), domain: url.hostname.toLowerCase(), reportTokenHash: tokenHash(token), leadId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000) } });
  return { job, token, duplicate: false };
}
export async function getAuditByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{40,}$/.test(token)) return null;
  return prisma.websiteAuditJob.findFirst({ where: { reportTokenHash: tokenHash(token), expiresAt: { gte: new Date() } }, include: { report: true } });
}

export async function recoverInterruptedAuditJobs() {
  await prisma.websiteAuditJob.updateMany({ where: { status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { lt: new Date() } }, data: { status: WebsiteAuditJobStatus.PENDING, failureReason: "WORKER_INTERRUPTED", startedAt: null, leaseExpiresAt: null, workerId: null } });
}

export async function processNextAuditJob(workerId: string = crypto.randomUUID()) {
  let candidate: Awaited<ReturnType<typeof claimNextAuditJob>>;
  try { candidate = await claimNextAuditJob(workerId); } catch { return false; }
  if (!candidate) return false;
  try {
    const fetched = await fetchAuditHtml(candidate.normalizedUrl);
    const evidence = extractHomepageEvidence(fetched.html, fetched.finalUrl);
    await prisma.$transaction([prisma.websiteAuditReport.upsert({ where: { auditJobId: candidate.id }, create: { auditJobId: candidate.id, auditedUrl: fetched.finalUrl, metadata: evidence.metadata, findings: evidence.findings }, update: { auditedUrl: fetched.finalUrl, metadata: evidence.metadata, findings: evidence.findings } }), prisma.websiteAuditJob.update({ where: { id: candidate.id }, data: { status: WebsiteAuditJobStatus.COMPLETED, completedAt: new Date(), failureReason: null, leaseExpiresAt: null } })]);
  } catch (error) {
    const code = error instanceof AuditFetchError ? error.code : "PROCESSING_FAILED";
    const retry = candidate.retryCount + 1;
    await prisma.websiteAuditJob.update({ where: { id: candidate.id }, data: retry <= maxRetries ? { status: WebsiteAuditJobStatus.PENDING, retryCount: retry, failureReason: code, startedAt: null, leaseExpiresAt: null, workerId: null } : { status: WebsiteAuditJobStatus.FAILED, retryCount: retry, failureReason: code, completedAt: new Date(), leaseExpiresAt: null } });
  }
  return true;
}

/** Serializable transaction: capacity checks and the pending→processing claim commit together. */
export async function claimNextAuditJob(workerId: string, beforeClaim?: () => Promise<void>) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const running = await tx.websiteAuditJob.count({ where: { status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } } });
        if (running >= globalConcurrency) return null;
        const candidate = await tx.websiteAuditJob.findFirst({ where: { status: WebsiteAuditJobStatus.PENDING }, orderBy: { createdAt: "asc" } });
        if (!candidate) return null;
        const domainRunning = await tx.websiteAuditJob.count({ where: { domain: candidate.domain, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } } });
        if (domainRunning >= domainConcurrency) return null;
        if (beforeClaim) await beforeClaim();
        const claim = await tx.websiteAuditJob.updateMany({ where: { id: candidate.id, status: WebsiteAuditJobStatus.PENDING }, data: { status: WebsiteAuditJobStatus.PROCESSING, startedAt: new Date(), workerId, leaseExpiresAt: new Date(Date.now() + 60_000) } });
        return claim.count ? candidate : null;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) { if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034" || attempt === 2) throw error; }
  }
  return null;
}
