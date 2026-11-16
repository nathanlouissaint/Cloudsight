import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";
import { getCachedJson, setCachedJson } from "../config/redis";
import { organizationCacheKeys } from "../services/organization-cache.service";
import { logger } from "../config/logger";

export async function getCostTrends(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });

    const cacheKey = organizationCacheKeys.costTrends(organizationId);
    const cachedTrends = await getCachedJson<Array<{ date: string; cost: number }>>(cacheKey);

    if (cachedTrends) {
      return res.status(200).json(cachedTrends);
    }

    const records = await prisma.costSnapshot.groupBy({
      by: ["snapshotDate"],
      _sum: { totalCost: true },
      where: { account: { organizationId } },
      orderBy: {
        snapshotDate: "asc",
      },
    });

    const trends = records.map((record) => ({
      date: record.snapshotDate.toISOString().split("T")[0],
      cost: Number((record._sum.totalCost ?? 0).toFixed(2)),
    }));

    void setCachedJson(cacheKey, trends, 60);

    return res.status(200).json(trends);
  } catch (error) {
    logger.error({ err: error }, "Cost trends error");

    return res.status(500).json({
      message:
        "Failed to load cost trends",
    });
  }
}

export async function getServiceBreakdown(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });

    const cacheKey = organizationCacheKeys.serviceSummary(organizationId);
    const cachedBreakdown = await getCachedJson<Array<{ service: string; cost: number }>>(cacheKey);

    if (cachedBreakdown) {
      return res.status(200).json(cachedBreakdown);
    }

    const records = await prisma.serviceCostSnapshot.groupBy({
      by: ["serviceName"],
      _sum: { cost: true },
      where: { account: { organizationId } },
    });

    const breakdown = records
      .map((record) => ({
        service: record.serviceName,
        cost: Number((record._sum.cost ?? 0).toFixed(2)),
      }))
      .sort(
        (a, b) => b.cost - a.cost
      );

    void setCachedJson(cacheKey, breakdown, 60);

    return res.status(200).json(
      breakdown
    );
  } catch (error) {
    logger.error({ err: error }, "Service breakdown error");

    return res.status(500).json({
      message:
        "Failed to load service breakdown",
    });
  }
}
