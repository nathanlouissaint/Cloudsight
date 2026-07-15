/*
  Warnings:

  - You are about to drop the column `reportId` on the `ReportNote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReportNote" DROP CONSTRAINT "ReportNote_reportId_fkey";

-- DropIndex
DROP INDEX "ReportNote_reportId_idx";

-- AlterTable
ALTER TABLE "ReportNote" DROP COLUMN "reportId";
