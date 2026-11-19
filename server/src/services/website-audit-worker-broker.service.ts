import { Prisma, WebsiteAuditJobStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { analyzeHomepageConversion, type HomepageAuditMetadata } from "./website-audit-conversion-analysis.service";
import { isAiAnalysisConfigured, safelyRequestAiRecommendations } from "./website-audit-ai-analysis.service";

const maxRetries = 2;

export async function completeBrokeredAuditJob(jobId: string, workerId: string, auditedUrl: string, metadata: HomepageAuditMetadata) {
  const activeJob = await prisma.websiteAuditJob.findFirst({ where: { id: jobId, workerId, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } } });
  if (!activeJob) return false;
  const reservation = isAiAnalysisConfigured() && !activeJob.aiAnalysisAttemptedAt
    ? await prisma.websiteAuditJob.updateMany({ where: { id: activeJob.id, workerId, status: WebsiteAuditJobStatus.PROCESSING, aiAnalysisAttemptedAt: null }, data: { aiAnalysisAttemptedAt: new Date() } })
    : { count: 0 };
  const findings = analyzeHomepageConversion(metadata, auditedUrl);
  // Keep provider latency outside the transaction that finalizes the lease.
  const aiRecommendations = reservation.count ? await safelyRequestAiRecommendations(metadata, findings) : null;
  return prisma.$transaction(async (tx) => {
    const job = await tx.websiteAuditJob.findFirst({ where: { id: jobId, workerId, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } } });
    if (!job) return false;
    await tx.websiteAuditReport.upsert({ where: { auditJobId: job.id }, create: { auditJobId: job.id, auditedUrl, metadata, findings, aiRecommendations: aiRecommendations ?? Prisma.JsonNull }, update: { auditedUrl, metadata, findings, aiRecommendations: aiRecommendations ?? Prisma.JsonNull } });
    const completed = await tx.websiteAuditJob.updateMany({ where: { id: job.id, workerId, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } }, data: { status: WebsiteAuditJobStatus.COMPLETED, completedAt: new Date(), failureReason: null, leaseExpiresAt: null, workerId: null } });
    if (completed.count !== 1) throw new Error("BROKER_CLAIM_LOST");
    return true;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function failBrokeredAuditJob(jobId: string, workerId: string, code: string) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.websiteAuditJob.findFirst({ where: { id: jobId, workerId, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } } });
    if (!job) return false;
    const retry = job.retryCount + 1;
    const update = retry <= maxRetries
      ? { status: WebsiteAuditJobStatus.PENDING, retryCount: retry, failureReason: code, startedAt: null, leaseExpiresAt: null, workerId: null }
      : { status: WebsiteAuditJobStatus.FAILED, retryCount: retry, failureReason: code, completedAt: new Date(), leaseExpiresAt: null, workerId: null };
    const failed = await tx.websiteAuditJob.updateMany({ where: { id: job.id, workerId, status: WebsiteAuditJobStatus.PROCESSING, leaseExpiresAt: { gt: new Date() } }, data: update });
    return failed.count === 1;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
