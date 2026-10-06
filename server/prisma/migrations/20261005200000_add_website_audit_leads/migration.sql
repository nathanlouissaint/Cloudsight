-- CreateEnum
CREATE TYPE "WebsiteAuditLeadStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CALL_BOOKED',
  'PROPOSAL_SENT',
  'WON',
  'LOST'
);

-- CreateEnum
CREATE TYPE "WebsiteAuditLeadSource" AS ENUM ('WEBSITE_AUDIT_FUNNEL');

-- CreateTable
CREATE TABLE "WebsiteAuditLead" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "workEmail" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "websiteUrl" TEXT NOT NULL,
  "companyDescription" TEXT NOT NULL,
  "websiteProblem" TEXT NOT NULL,
  "launchTimeline" TEXT NOT NULL,
  "budgetRange" TEXT NOT NULL,
  "status" "WebsiteAuditLeadStatus" NOT NULL DEFAULT 'NEW',
  "source" "WebsiteAuditLeadSource" NOT NULL DEFAULT 'WEBSITE_AUDIT_FUNNEL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WebsiteAuditLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteAuditLead_workEmail_websiteUrl_createdAt_idx"
ON "WebsiteAuditLead"("workEmail", "websiteUrl", "createdAt");

-- CreateIndex
CREATE INDEX "WebsiteAuditLead_status_createdAt_idx"
ON "WebsiteAuditLead"("status", "createdAt");
