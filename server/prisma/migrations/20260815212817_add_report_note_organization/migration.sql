/*
  Warnings:

  - Added the required column `organizationId` to the `ReportNote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReportNote" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ReportNote_organizationId_idx" ON "ReportNote"("organizationId");

-- AddForeignKey
ALTER TABLE "ReportNote" ADD CONSTRAINT "ReportNote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
