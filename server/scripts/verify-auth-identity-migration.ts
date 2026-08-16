import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

const databaseUrl = validateTestDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;
const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl } },
});
const migrationName =
  "20260810000000_add_auth_identities";
const userId =
  "c336-legacy-google-migration-user";
const email =
  "c336-legacy-google-migration@example.test";
const googleId = "legacy-google-subject-336";

function runPrisma(...args: string[]): void {
  const result = spawnSync("npx", ["prisma", ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      NODE_ENV: "test",
    },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Prisma ${args.join(" ")} failed with exit code ${result.status}`,
    );
  }
}

async function main(): Promise<void> {
  try {
    // First prove the complete migration chain succeeds on a fresh database.
    runPrisma(
      "migrate",
      "reset",
      "--force",
      "--skip-seed",
    );

    // Reconstruct the state immediately before the final, uncommitted migration
    // without touching any database outside the guarded disposable target.
    await prisma.$executeRawUnsafe(
      'DROP TABLE "AuthIdentity"',
    );
    await prisma.$executeRawUnsafe(
      'DROP TYPE "FederatedProviderKind"',
    );
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = ${migrationName}
    `;
    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash: null,
        authProvider: "GOOGLE",
        googleId,
        emailVerifiedAt: new Date(),
      },
    });
    await prisma.$disconnect();

    runPrisma("migrate", "deploy");

    await prisma.$connect();
    const identity =
      await prisma.authIdentity.findUnique({
        where: {
          issuer_providerSubject: {
            issuer:
              "https://accounts.google.com",
            providerSubject: googleId,
          },
        },
      });

    if (
      identity?.userId !== userId ||
      identity.providerKind !== "GOOGLE"
    ) {
      throw new Error(
        "Legacy Google identity was not backfilled correctly",
      );
    }

    const { federatedAuthService } = await import(
      "../src/services/auth/federated-auth.service.js"
    );
    const resolution =
      await federatedAuthService.classifyIdentity({
        providerKind: "GOOGLE",
        issuer: "https://accounts.google.com",
        subject: googleId,
        email: "changed-email@example.test",
        emailVerified: true,
      });

    if (
      resolution.kind !== "EXISTING_IDENTITY" ||
      resolution.userId !== userId
    ) {
      throw new Error(
        "Backfilled Google identity did not resolve its existing user",
      );
    }

    console.log(
      "AuthIdentity migration verification passed: fresh migration and legacy Google backfill",
    );
  } finally {
    await prisma.user
      .deleteMany({ where: { id: userId } })
      .catch(() => undefined);
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "AuthIdentity migration verification failed",
  );
  process.exitCode = 1;
});
