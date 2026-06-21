import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getExecutiveReport(
  _req: Request,
  res: Response
) {
  try {
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

    const totalSpend =
      spendResult._sum.cost ?? 0;

    const elapsedDays =
      now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const forecastedSpend =
      (totalSpend / elapsedDays) *
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

    const usagePercent =
      budgetAmount > 0
        ? (totalSpend / budgetAmount) * 100
        : 0;

    let budgetStatus = "healthy";

    if (usagePercent >= 100) {
      budgetStatus = "exceeded";
    } else if (usagePercent >= 85) {
      budgetStatus = "critical";
    } else if (usagePercent >= 70) {
      budgetStatus = "warning";
    }

    const serviceRecords =
      await prisma.costRecord.findMany({
        where: {
          usageDate: {
            gte: currentMonthStart,
          },
        },
        include: {
          service: true,
        },
      });

    const serviceTotals = new Map<
      string,
      number
    >();

    for (const record of serviceRecords) {
      const current =
        serviceTotals.get(
          record.service.name
        ) ?? 0;

      serviceTotals.set(
        record.service.name,
        current + record.cost
      );
    }

    const sortedServices = Array.from(
      serviceTotals.entries()
    ).sort(
      (a, b) => b[1] - a[1]
    );

    const topService =
      sortedServices[0]?.[0] ??
      "Unknown";

    const topServiceSpend =
      sortedServices[0]?.[1] ?? 0;

    const topServicePercent =
      totalSpend > 0
        ? (
            (topServiceSpend /
              totalSpend) *
            100
          ).toFixed(1)
        : "0";

    const monthName =
      now.toLocaleString("en-US", {
        month: "long",
      });

    const summary =
      `Current spending is tracking ${forecastedSpend <= budgetAmount ? "below" : "above"} budget. ${topService} remains the largest cost driver representing ${topServicePercent}% of monthly spend. Forecasted end-of-month spend is $${forecastedSpend.toFixed(
        2
      )}.`;

    return res.status(200).json({
      period: `${monthName} ${now.getFullYear()}`,
      totalSpend: Number(
        totalSpend.toFixed(2)
      ),
      budget: Number(
        budgetAmount.toFixed(2)
      ),
      forecastedSpend: Number(
        forecastedSpend.toFixed(2)
      ),
      topService,
      topServiceSpend: Number(
        topServiceSpend.toFixed(2)
      ),
      budgetStatus,
      summary,
    });
  } catch (error) {
    console.error(
      "Executive report error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate report",
    });
  }
}
