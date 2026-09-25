import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";

export async function getCostTrends(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });

    const records = await prisma.costSnapshot.findMany({
      where: { account: { organizationId } },
      orderBy: {
        snapshotDate: "asc",
      },
    });

    const dailyTotals = new Map<string, number>();

    for (const record of records) {
      const date = record.snapshotDate
        .toISOString()
        .split("T")[0];

      const current =
        dailyTotals.get(date) ?? 0;

      dailyTotals.set(
        date,
        current + record.totalCost
      );
    }

    const trends = Array.from(
      dailyTotals.entries()
    ).map(([date, cost]) => ({
      date,
      cost: Number(cost.toFixed(2)),
    }));

    return res.status(200).json(trends);
  } catch (error) {
    console.error(
      "Cost trends error:",
      error
    );

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

    const records = await prisma.serviceCostSnapshot.findMany({
      where: { account: { organizationId } },
    });

    const totals = new Map<
      string,
      number
    >();

    for (const record of records) {
      const serviceName =
        record.serviceName;

      const current =
        totals.get(serviceName) ?? 0;

      totals.set(
        serviceName,
        current + record.cost
      );
    }

    const breakdown = Array.from(
      totals.entries()
    )
      .map(([service, cost]) => ({
        service,
        cost: Number(cost.toFixed(2)),
      }))
      .sort(
        (a, b) => b.cost - a.cost
      );

    return res.status(200).json(
      breakdown
    );
  } catch (error) {
    console.error(
      "Service breakdown error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load service breakdown",
    });
  }
}
