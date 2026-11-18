ALTER TABLE "WebsiteAuditJob" ADD COLUMN "domain" TEXT NOT NULL DEFAULT '';
ALTER TABLE "WebsiteAuditJob" ADD COLUMN "leaseExpiresAt" TIMESTAMP(3);
ALTER TABLE "WebsiteAuditJob" ADD COLUMN "workerId" TEXT;
ALTER TABLE "WebsiteAuditJob" ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days';
CREATE INDEX "WebsiteAuditJob_domain_status_idx" ON "WebsiteAuditJob"("domain", "status");
