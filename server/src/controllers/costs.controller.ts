import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getCostTrends(
  _req: Request,
  res: Response
) {
  try {
    const records = await prisma.costRecord.findMany({
      orderBy: {
        usageDate: "asc",
      },
    });

    const dailyTotals = new Map<string, number>();

    for (const record of records) {
      const date = record.usageDate
        .toISOString()
        .split("T")[0];

      const current =
        dailyTotals.get(date) ?? 0;

      dailyTotals.set(
        date,
        current + record.cost
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
  _req: Request,
  res: Response
) {
  try {
    const records =
      await prisma.costRecord.findMany({
        include: {
          service: true,
        },
      });

    const totals = new Map<
      string,
      number
    >();

    for (const record of records) {
      const serviceName =
        record.service.name;

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
