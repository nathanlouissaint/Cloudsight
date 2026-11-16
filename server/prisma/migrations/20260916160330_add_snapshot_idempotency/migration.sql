/*
  Warnings:

  - A unique constraint covering the columns `[accountId,snapshotDate]` on the table `CostSnapshot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accountId,serviceName,snapshotDate]` on the table `ServiceCostSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CostSnapshot_accountId_snapshotDate_key" ON "CostSnapshot"("accountId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCostSnapshot_accountId_serviceName_snapshotDate_key" ON "ServiceCostSnapshot"("accountId", "serviceName", "snapshotDate");
