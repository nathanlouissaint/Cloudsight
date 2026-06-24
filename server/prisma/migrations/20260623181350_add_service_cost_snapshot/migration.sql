-- CreateTable
CREATE TABLE "ServiceCostSnapshot" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceCostSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceCostSnapshot_accountId_idx" ON "ServiceCostSnapshot"("accountId");

-- CreateIndex
CREATE INDEX "ServiceCostSnapshot_snapshotDate_idx" ON "ServiceCostSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "ServiceCostSnapshot_serviceName_idx" ON "ServiceCostSnapshot"("serviceName");

-- AddForeignKey
ALTER TABLE "ServiceCostSnapshot" ADD CONSTRAINT "ServiceCostSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CloudAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
