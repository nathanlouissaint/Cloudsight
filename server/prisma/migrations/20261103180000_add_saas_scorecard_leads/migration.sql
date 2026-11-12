CREATE TABLE "SaasScorecardLead" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "workEmail" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "websiteUrl" TEXT NOT NULL,
  "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
  "totalScore" DOUBLE PRECISION NOT NULL,
  "categoryScores" JSONB NOT NULL,
  "answerIds" JSONB NOT NULL,
  "scoringVersion" TEXT NOT NULL,
  "recommendations" JSONB NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'SAAS_SCORECARD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SaasScorecardLead_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SaasScorecardLead_workEmail_websiteUrl_createdAt_idx" ON "SaasScorecardLead"("workEmail", "websiteUrl", "createdAt");
