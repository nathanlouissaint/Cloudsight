-- Add updatedAt to existing Budget rows safely.
ALTER TABLE "Budget"
ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "Budget"
SET "updatedAt" = "createdAt"
WHERE "updatedAt" IS NULL;

ALTER TABLE "Budget"
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Enforce one budget per user per calendar month.
CREATE UNIQUE INDEX "Budget_userId_year_month_key"
ON "Budget"("userId", "year", "month");

-- Support user-scoped budget lookups.
CREATE INDEX "Budget_userId_idx"
ON "Budget"("userId");
