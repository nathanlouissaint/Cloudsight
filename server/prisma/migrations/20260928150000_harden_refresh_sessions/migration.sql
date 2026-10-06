-- Add refresh-token rotation and reuse-detection state.
ALTER TABLE "Session"
  ADD COLUMN "tokenFamilyId" TEXT,
  ADD COLUMN "replacedAt" TIMESTAMP(3),
  ADD COLUMN "replacedBySessionId" TEXT,
  ADD COLUMN "reuseDetectedAt" TIMESTAMP(3);

-- Existing sessions, if any, receive their own family before the column is required.
UPDATE "Session"
SET "tokenFamilyId" = md5("id" || clock_timestamp()::text)
WHERE "tokenFamilyId" IS NULL;

ALTER TABLE "Session"
  ALTER COLUMN "tokenFamilyId" SET NOT NULL;

CREATE INDEX "Session_tokenFamilyId_idx"
  ON "Session"("tokenFamilyId");
