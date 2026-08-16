import { prisma } from "../src/config/prisma";
import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

const GITHUB_EMAIL = "cloudsight-e2e-controlled-github@example.test";

async function main() {
  if (process.env.NODE_ENV !== "test") throw new Error("Test-only helper");
  const url = validateTestDatabaseUrl();
  if (!url.includes("cloudsight_test")) throw new Error("Unsafe test database");

  const command = process.argv[2];
  if (command === "seed-local") {
    const user = await prisma.user.upsert({
      where: { email: GITHUB_EMAIL },
      update: {},
      create: { email: GITHUB_EMAIL, passwordHash: "e2e-local-collision-not-a-login-credential" },
    });
    process.stdout.write(JSON.stringify({ userId: user.id }));
  } else if (command === "remove-local") {
    const user = await prisma.user.findUnique({ where: { email: GITHUB_EMAIL } });
    if (user && await prisma.authIdentity.count({ where: { userId: user.id } }) === 0) {
      await prisma.user.delete({ where: { id: user.id } });
    }
  } else {
    throw new Error("Expected seed-local or remove-local");
  }

  await prisma.$disconnect();
}

void main();
