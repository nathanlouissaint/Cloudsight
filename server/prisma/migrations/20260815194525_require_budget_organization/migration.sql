/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,year,month]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.
  - Made the column `organizationId` on table `Budget` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Budget_userId_year_month_key";

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Budget_organizationId_year_month_key" ON "Budget"("organizationId", "year", "month");
