-- AlterTable
ALTER TABLE "CloudAccount" ADD COLUMN     "connectionError" TEXT,
ADD COLUMN     "connectionStatus" TEXT NOT NULL DEFAULT 'NOT_CONFIGURED',
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "roleArn" TEXT;
