import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { logger } from "../config/logger";
import { captureException } from "../config/sentry";

export function notFoundHandler(
  _req: Request,
  res: Response
) {
  res.status(404).json({
    error: "Not Found",
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err }, "Unhandled request error");
  captureException(err, {
    method: _req.method,
    path: _req.originalUrl,
  });

  res.status(500).json({
    error: "Internal Server Error",
  });
}
