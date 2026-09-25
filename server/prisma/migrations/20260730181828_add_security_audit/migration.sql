-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('LOGIN', 'LOGOUT', 'LOGOUT_ALL', 'SESSION_REVOKED', 'PASSWORD_CHANGED', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "SecurityAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" "AuditEventType" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityAudit_userId_idx" ON "SecurityAudit"("userId");

-- CreateIndex
CREATE INDEX "SecurityAudit_eventType_idx" ON "SecurityAudit"("eventType");

-- CreateIndex
CREATE INDEX "SecurityAudit_createdAt_idx" ON "SecurityAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "SecurityAudit" ADD CONSTRAINT "SecurityAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
