import * as Sentry from "@sentry/node";
import { logger } from "./logger";

let sentryEnabled = false;

/**
 * Sentry is optional: local and self-hosted deployments remain operational
 * without a DSN, while production can enable reporting through configuration.
 */
export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN?.trim();

  if (!dsn) {
    logger.info("Sentry error reporting is disabled because SENTRY_DSN is not configured.");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    release: process.env.SENTRY_RELEASE,
  });

  sentryEnabled = true;
  logger.info("Sentry error reporting is enabled.");
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!sentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("cloudsight", context);
    }

    Sentry.captureException(error);
  });
}

export async function flushSentry(timeout = 2_000) {
  if (sentryEnabled) {
    await Sentry.close(timeout);
  }
}
