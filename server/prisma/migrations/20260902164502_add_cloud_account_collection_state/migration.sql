-- AlterTable
ALTER TABLE "CloudAccount" ADD COLUMN     "collectionError" TEXT,
ADD COLUMN     "lastCollectionAttemptAt" TIMESTAMP(3),
ADD COLUMN     "lastSuccessfulSyncAt" TIMESTAMP(3);
