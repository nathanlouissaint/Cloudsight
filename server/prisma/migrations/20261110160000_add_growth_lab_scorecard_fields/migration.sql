ALTER TABLE "SaasScorecardLead"
  ADD COLUMN "fullName" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "assessmentAnswers" JSONB,
  ADD COLUMN "report" JSONB;
