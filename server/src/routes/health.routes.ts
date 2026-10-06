import { Router } from "express";
import { prisma } from "../config/prisma";
import { isRedisHealthy } from "../config/redis";
import { logger } from "../config/logger";

const router = Router();

router.get("/live", (_req, res) => {
  res.status(200).json({
    status: "alive",
    service: "CloudSight API",
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisHealthy = await isRedisHealthy();

    if (!redisHealthy) {
      return res.status(503).json({
        status: "not-ready",
        database: "connected",
        redis: "unavailable",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "ready",
      database: "connected",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn({ err: error }, "Readiness check failed");

    res.status(503).json({
      status: "not-ready",
      database: "unavailable",
      redis: "unknown",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const redisHealthy = await isRedisHealthy();

    if (!redisHealthy) {
      return res.status(503).json({
        status: "degraded",
        service: "CloudSight API",
        version: process.env.npm_package_version ?? "1.0.0",
        uptime: Math.round(process.uptime()),
        database: "connected",
        redis: "unavailable",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "healthy",
      service: "CloudSight API",
      version: process.env.npm_package_version ?? "1.0.0",
      uptime: Math.round(process.uptime()),
      database: "connected",
      redis: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn({ err: error }, "Health check failed");

    res.status(503).json({
      status: "degraded",
      service: "CloudSight API",
      version: process.env.npm_package_version ?? "1.0.0",
      uptime: Math.round(process.uptime()),
      database: "unavailable",
      redis: "unknown",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
