import { PrismaClient } from "@prisma/client";
import { validateTestDatabaseUrl } from "./test-database";

export function createPrismaTestClient(): PrismaClient {
  const url = validateTestDatabaseUrl();
  return new PrismaClient({ datasources: { db: { url } } });
}
