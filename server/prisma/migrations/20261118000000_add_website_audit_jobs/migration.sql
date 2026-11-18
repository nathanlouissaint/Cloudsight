CREATE TYPE "WebsiteAuditJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE "WebsiteAuditJob" (
  "id" TEXT NOT NULL,
  "submittedUrl" TEXT NOT NULL,
  "normalizedUrl" TEXT NOT NULL,
  "status" "WebsiteAuditJobStatus" NOT NULL DEFAULT 'PENDING',
  "failureReason" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "reportTokenHash" TEXT NOT NULL,
  "leadId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "WebsiteAuditJob_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WebsiteAuditReport" (
  "id" TEXT NOT NULL,
  "auditJobId" TEXT NOT NULL,
  "auditedUrl" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "findings" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebsiteAuditReport_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebsiteAuditJob_reportTokenHash_key" ON "WebsiteAuditJob"("reportTokenHash");
CREATE INDEX "WebsiteAuditJob_status_createdAt_idx" ON "WebsiteAuditJob"("status", "createdAt");
CREATE INDEX "WebsiteAuditJob_leadId_idx" ON "WebsiteAuditJob"("leadId");
CREATE UNIQUE INDEX "WebsiteAuditReport_auditJobId_key" ON "WebsiteAuditReport"("auditJobId");
ALTER TABLE "WebsiteAuditJob" ADD CONSTRAINT "WebsiteAuditJob_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "WebsiteAuditLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebsiteAuditReport" ADD CONSTRAINT "WebsiteAuditReport_auditJobId_fkey" FOREIGN KEY ("auditJobId") REFERENCES "WebsiteAuditJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
