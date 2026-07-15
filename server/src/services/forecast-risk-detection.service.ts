import { prisma } from "../config/prisma";

import type {
  AlertModel,
} from "../types/alert.types";

export class ForecastRiskDetectionService {

  async detectForecastRisk(): Promise<AlertModel[]> {

    const now = new Date();

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

    if (!budget) {
      return [];
    }

 const spend =
  await prisma.costRecord.aggregate({
    _sum: {
      cost: true,
    },
    where: {
      usageDate: {
        gte: new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ),
      },
    },
  });

const currentSpend =
  spend._sum.cost ?? 0;

    const elapsedDays =
      Math.max(now.getDate(), 1);

    const daysInMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

    const projectedSpend =
      (currentSpend / elapsedDays) *
      daysInMonth;

    if (
      projectedSpend <= budget.amount
    ) {
      return [];
    }

    return [
      {
        id: "forecast-risk",

        type: "forecast_risk",

        severity: "critical",

        status: "active",

        title:
          "Forecast Exceeds Budget",

        description:
          `Projected month-end spend exceeds budget by $${(
            projectedSpend -
            budget.amount
          ).toFixed(2)}.`,

        recommendation:
          "Reduce projected spend before month-end by optimizing high-cost services or adjusting workloads.",

        metric:
          "Projected Spend",

        currentValue:
          Number(
            projectedSpend.toFixed(2)
          ),

        threshold:
          budget.amount,

        date:
          now
            .toISOString()
            .split("T")[0],
      },
    ];

  }

}

export const forecastRiskDetectionService =
  new ForecastRiskDetectionService();
