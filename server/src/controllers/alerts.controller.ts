import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getAlerts(
  _req: Request,
  res: Response
) {
  try {
    const alerts = [];

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

    const dailySpend = Array.from(
      dailyTotals.entries()
    ).map(([date, cost]) => ({
      date,
      cost,
    }));

    if (dailySpend.length >= 8) {
      const latest =
        dailySpend[dailySpend.length - 1];

      const previous7 =
        dailySpend.slice(
          dailySpend.length - 8,
          dailySpend.length - 1
        );

      const rollingAverage =
        previous7.reduce(
          (sum, day) => sum + day.cost,
          0
        ) / previous7.length;

      const ratio =
        latest.cost / rollingAverage;

      if (ratio >= 2) {
        alerts.push({
          type: "cost_spike",
          severity: "critical",
          title: "Major Cost Spike",
          description: `Daily spend is ${(
            (ratio - 1) *
            100
          ).toFixed(0)}% above the 7-day average.`,
          date: latest.date,
        });
      } else if (ratio >= 1.5) {
        alerts.push({
          type: "cost_spike",
          severity: "warning",
          title: "Unusual Cost Increase",
          description: `Daily spend is ${(
            (ratio - 1) *
            100
          ).toFixed(0)}% above the 7-day average.`,
          date: latest.date,
        });
      } else if (ratio >= 1.2) {
        alerts.push({
          type: "cost_spike",
          severity: "info",
          title: "Cost Increase Detected",
          description: `Daily spend is ${(
            (ratio - 1) *
            100
          ).toFixed(0)}% above the 7-day average.`,
          date: latest.date,
        });
      }
    }

    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const spendResult =
      await prisma.costRecord.aggregate({
        _sum: {
          cost: true,
        },
        where: {
          usageDate: {
            gte: currentMonthStart,
          },
        },
      });

    const currentSpend =
      spendResult._sum.cost ?? 0;

    const elapsedDays =
      now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const projectedSpend =
      (currentSpend / elapsedDays) *
      daysInMonth;

    const budget =
      await prisma.budget.findFirst({
        where: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const budgetAmount =
      budget?.amount ?? 0;

    if (
      budgetAmount > 0 &&
      projectedSpend > budgetAmount
    ) {
      alerts.push({
        type: "budget_risk",
        severity: "critical",
        title: "Projected Budget Breach",
        description: `Forecasted spend exceeds budget by $${(
          projectedSpend - budgetAmount
        ).toFixed(2)}.`,
        date: now
          .toISOString()
          .split("T")[0],
      });
    }

    const severityOrder = {
      critical: 3,
      warning: 2,
      info: 1,
    };

    alerts.sort(
      (a, b) =>
        severityOrder[
          b.severity as keyof typeof severityOrder
        ] -
        severityOrder[
          a.severity as keyof typeof severityOrder
        ]
    );

    return res.status(200).json(alerts);
  } catch (error) {
    console.error(
      "Alerts error:",
      error
    );

    return res.status(500).json({
      message: "Failed to load alerts",
    });
  }
}
