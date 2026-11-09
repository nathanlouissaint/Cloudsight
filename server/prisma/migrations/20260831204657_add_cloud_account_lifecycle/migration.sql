-- AlterTable
ALTER TABLE "CloudAccount" ADD COLUMN     "disconnectedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
