import type { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getBudgetSummary(
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

    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const budget = await prisma.budget.findFirst({
      where: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const spendResult = await prisma.costRecord.aggregate({
      _sum: {
        cost: true,
      },
      where: {
        usageDate: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    const spent = spendResult._sum.cost ?? 0;
    const budgetAmount = budget?.amount ?? 0;
    const remaining = budgetAmount - spent;

    const usagePercent =
      budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    let status = "healthy";

    if (usagePercent >= 100) {
      status = "exceeded";
    } else if (usagePercent >= 85) {
      status = "critical";
    } else if (usagePercent >= 70) {
      status = "warning";
    }

    return res.status(200).json({
      budget: Number(budgetAmount.toFixed(2)),
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      usagePercent: Number(usagePercent.toFixed(2)),
      status,
    });
  } catch (error) {
    console.error("Budget summary error:", error);

    return res.status(500).json({
      message: "Failed to load budget summary",
    });
  }
}