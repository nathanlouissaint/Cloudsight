/*
  Warnings:

  - You are about to drop the column `userId` on the `Budget` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropIndex
DROP INDEX "Budget_userId_idx";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "userId";
