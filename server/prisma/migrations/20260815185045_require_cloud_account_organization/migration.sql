/*
  Warnings:

  - Made the column `organizationId` on table `CloudAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CloudAccount" ALTER COLUMN "organizationId" SET NOT NULL;
