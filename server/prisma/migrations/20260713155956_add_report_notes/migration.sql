/*
  Warnings:

  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ReportNote" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportNote_reportId_idx" ON "ReportNote"("reportId");

-- CreateIndex
CREATE INDEX "ReportNote_createdAt_idx" ON "ReportNote"("createdAt");

-- AddForeignKey
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
