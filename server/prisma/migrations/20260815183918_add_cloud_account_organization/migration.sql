-- AlterTable
ALTER TABLE "CloudAccount" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "CloudAccount_organizationId_idx" ON "CloudAccount"("organizationId");

-- AddForeignKey
ALTER TABLE "CloudAccount" ADD CONSTRAINT "CloudAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
