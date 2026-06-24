-- CreateTable
CREATE TABLE "CloudAccount" (
    "id" TEXT NOT NULL,
    "awsAccountId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostSnapshot" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CostSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetSnapshot" (
    "id" TEXT NOT NULL,
    "budgetName" TEXT NOT NULL,
    "budgetAmount" DOUBLE PRECISION NOT NULL,
    "actualSpend" DOUBLE PRECISION NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CloudAccount_awsAccountId_key" ON "CloudAccount"("awsAccountId");

-- CreateIndex
CREATE INDEX "CostSnapshot_snapshotDate_idx" ON "CostSnapshot"("snapshotDate");

-- CreateIndex
CREATE INDEX "BudgetSnapshot_snapshotDate_idx" ON "BudgetSnapshot"("snapshotDate");

-- AddForeignKey
ALTER TABLE "CostSnapshot" ADD CONSTRAINT "CostSnapshot_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CloudAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
