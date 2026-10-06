-- Supports organization-scoped service cost queries through CloudAccount.
CREATE INDEX "ServiceCostSnapshot_accountId_snapshotDate_idx"
ON "ServiceCostSnapshot"("accountId", "snapshotDate");
