import { Router } from "express";
import { prisma } from "../config/prisma";

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

    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "not-ready",
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      service: "CloudSight API",
      version: process.env.npm_package_version ?? "1.0.0",
      uptime: Math.round(process.uptime()),
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      service: "CloudSight API",
      version: process.env.npm_package_version ?? "1.0.0",
      uptime: Math.round(process.uptime()),
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
