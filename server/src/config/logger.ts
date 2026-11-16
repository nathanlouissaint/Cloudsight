import pino from "pino";
import pinoHttp from "pino-http";

const service = process.env.SERVICE_NAME?.trim() || "cloudsight-api";

const loggingOptions: pino.LoggerOptions = {
  base: { service },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers.x-api-key",
      "req.headers.x-forwarded-authorization",
    ],
    censor: "[Redacted]",
  },
};

export const logger = pino(loggingOptions);

export const httpLogger = pinoHttp({
  ...loggingOptions,
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});
