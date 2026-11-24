import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { prisma } from "./config/prisma";
import { validateEnvironment } from "./config/environment";
import { connectRedis, disconnectRedis } from "./config/redis";
import { logger } from "./config/logger";
import { captureException, flushSentry, initializeSentry } from "./config/sentry";

validateEnvironment();
initializeSentry();
void connectRedis();

const PORT =
  Number(process.env.PORT) || 5000;

const server =
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "CloudSight API started");
  });

let shuttingDown = false;

async function shutdown(
  signal: string,
  error?: unknown,
) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, "Shutdown started");

  if (error) {
    logger.fatal({ err: error, signal }, "Process terminated after an unhandled error");
    captureException(error, { signal, source: "process" });
  }

  const forceShutdown = setTimeout(() => {
    logger.fatal({ signal }, "Shutdown timed out");
    process.exit(1);
  }, 10_000);

  forceShutdown.unref();

  server.close(async () => {
    try {
      clearTimeout(forceShutdown);
      await flushSentry();
      await disconnectRedis();
      await prisma.$disconnect();

      logger.info({ signal }, "Shutdown complete");

      process.exit(error ? 1 : 0);
    } catch (shutdownError) {
      logger.fatal({ err: shutdownError, signal }, "Shutdown failed");
      process.exit(1);
    }
  });
}

process.on(
  "SIGINT",
  () => void shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => void shutdown("SIGTERM")
);

process.on("uncaughtException", (error) => {
  void shutdown("uncaughtException", error);
});

process.on("unhandledRejection", (reason) => {
  void shutdown("unhandledRejection", reason);
});
