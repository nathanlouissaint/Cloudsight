import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple PrismaClient instances during development.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

if (process.env.NODE_ENV === "test" && !databaseUrl) {
  throw new Error("TEST_DATABASE_URL is required when NODE_ENV=test");
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}