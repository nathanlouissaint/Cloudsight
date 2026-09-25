-- CreateEnum
CREATE TYPE "FederatedProviderKind" AS ENUM ('GOOGLE', 'MICROSOFT', 'GITHUB', 'OIDC', 'SAML');

-- Extend legacy user metadata so it accurately describes every supported
-- federated account creation path.
ALTER TYPE "AuthProvider" ADD VALUE IF NOT EXISTS 'MICROSOFT';
ALTER TYPE "AuthProvider" ADD VALUE IF NOT EXISTS 'GITHUB';

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerKind" "FederatedProviderKind" NOT NULL,
    "issuer" TEXT NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "providerEmail" TEXT,
    "providerEmailVerified" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_issuer_providerSubject_key" ON "AuthIdentity"("issuer", "providerSubject");

-- CreateIndex
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");

-- Preserve immutable ownership for users created by the legacy Google flow.
-- Email is copied only as metadata; issuer + subject remains the identity key.
INSERT INTO "AuthIdentity" (
    "id",
    "userId",
    "providerKind",
    "issuer",
    "providerSubject",
    "providerEmail",
    "providerEmailVerified",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('legacy-google-', "id"),
    "id",
    'GOOGLE'::"FederatedProviderKind",
    'https://accounts.google.com',
    "googleId",
    "email",
    ("emailVerifiedAt" IS NOT NULL),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE "googleId" IS NOT NULL
ON CONFLICT ("issuer", "providerSubject") DO NOTHING;

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
