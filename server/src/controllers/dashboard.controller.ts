import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getDashboardSummary(
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

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    const currentMonthSpendResult =
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

    const previousMonthSpendResult =
      await prisma.costRecord.aggregate({
        _sum: {
          cost: true,
        },
        where: {
          usageDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
        },
      });

    const currentMonthSpend =
      currentMonthSpendResult._sum.cost ?? 0;

    const previousMonthSpend =
      previousMonthSpendResult._sum.cost ?? 0;

    const today = now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const averageDailySpend =
      currentMonthSpend / today;

    const forecastedSpend =
      averageDailySpend * daysInMonth;

    const budget = await prisma.budget.findFirst({
      where: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let budgetUsagePercent = 0;

    if (budget) {
      budgetUsagePercent =
        (currentMonthSpend / budget.amount) *
        100;
    }

    return res.status(200).json({
      currentMonthSpend: Number(
        currentMonthSpend.toFixed(2)
      ),
      previousMonthSpend: Number(
        previousMonthSpend.toFixed(2)
      ),
      forecastedSpend: Number(
        forecastedSpend.toFixed(2)
      ),
      budgetUsagePercent: Number(
        budgetUsagePercent.toFixed(2)
      ),
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load dashboard summary",
    });
  }
}
