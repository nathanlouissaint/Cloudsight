import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ForecastContract } from "../contracts/forecast.contract";

export async function getForecast(
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

    const currentSpend =
      spendResult._sum.cost ?? 0;

    const elapsedDays =
      now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const remainingDays =
      daysInMonth - elapsedDays;

    const averageDailySpend =
      currentSpend / elapsedDays;

    const projectedSpend =
      averageDailySpend * daysInMonth;

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

    const projectedVariance =
      budgetAmount - projectedSpend;

    const onTrack =
      projectedSpend <= budgetAmount;

    const response = ForecastContract.parse({
      currentSpend: Number(
        currentSpend.toFixed(2)
      ),
      averageDailySpend: Number(
        averageDailySpend.toFixed(2)
      ),
      elapsedDays,
      remainingDays,
      projectedSpend: Number(
        projectedSpend.toFixed(2)
      ),
      budget: Number(
        budgetAmount.toFixed(2)
      ),
      projectedVariance: Number(
        projectedVariance.toFixed(2)
      ),
      onTrack,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error(
      "Forecast error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load forecast",
    });
  }
}
