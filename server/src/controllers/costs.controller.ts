import type { Response } from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import { prisma } from "../config/prisma";

function requireOrganizationId(
  req: OrganizationAuthenticatedRequest,
  res: Response,
): string | null {
  const organizationId =
    req.organization?.id;

  if (!organizationId) {
    res.status(400).json({
      message:
        "Organization context is required",
    });

    return null;
  }

  return organizationId;
}

export async function getCostTrends(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(req, res);

  if (!organizationId) {
    return;
  }

  try {
    const records =
      await prisma.costSnapshot.findMany({
        where: {
          account: {
            organizationId,
          },
        },
        orderBy: {
          snapshotDate: "asc",
        },
      });

    const dailyTotals =
      new Map<string, number>();

    for (const record of records) {
      const date =
        record.snapshotDate
          .toISOString()
          .split("T")[0];

      const current =
        dailyTotals.get(date) ?? 0;

      dailyTotals.set(
        date,
        current + record.totalCost,
      );
    }

    const trends = Array.from(
      dailyTotals.entries(),
    ).map(([date, cost]) => ({
      date,
      cost: Number(
        cost.toFixed(2),
      ),
    }));

    return res.status(200).json(
      trends,
    );
  } catch (error) {
    console.error(
      "Cost trends error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load cost trends",
    });
  }
}

export async function getServiceBreakdown(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(req, res);

  if (!organizationId) {
    return;
  }

  try {
    const records =
      await prisma.serviceCostSnapshot.findMany({
        where: {
          account: {
            organizationId,
          },
        },
      });

    const totals =
      new Map<string, number>();

    for (const record of records) {
      const serviceName =
        record.serviceName;

      const current =
        totals.get(serviceName) ?? 0;

      totals.set(
        serviceName,
        current + record.cost,
      );
    }

    const breakdown = Array.from(
      totals.entries(),
    )
      .map(([service, cost]) => ({
        service,
        cost: Number(
          cost.toFixed(2),
        ),
      }))
      .sort(
        (a, b) =>
          b.cost - a.cost,
      );

    return res.status(200).json(
      breakdown,
    );
  } catch (error) {
    console.error(
      "Service breakdown error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load service breakdown",
    });
  }
}