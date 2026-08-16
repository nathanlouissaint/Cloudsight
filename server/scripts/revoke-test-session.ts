import { prisma } from "../src/config/prisma";
import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

async function main() {
  if (process.env.NODE_ENV !== "test") throw new Error("Test-only session mutation");
  const url = validateTestDatabaseUrl();
  if (!url.includes("cloudsight_test")) throw new Error("Unsafe test database");
  const id = process.argv[2];
  if (!id) throw new Error("Session id required");
  await prisma.session.update({ where: { id }, data: { revokedAt: new Date() } });
  await prisma.$disconnect();
}

void main();
