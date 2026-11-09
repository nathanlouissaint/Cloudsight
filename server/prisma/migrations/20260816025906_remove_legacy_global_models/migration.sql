/*
  Warnings:

  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BudgetSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CloudService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CostRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Forecast` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CostRecord" DROP CONSTRAINT "CostRecord_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "BudgetSnapshot";

-- DropTable
DROP TABLE "CloudService";

-- DropTable
DROP TABLE "CostRecord";

-- DropTable
DROP TABLE "Forecast";

-- DropTable
DROP TABLE "Report";
