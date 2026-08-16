import { prisma } from "../config/prisma";

import {
  budgetService,
} from "./budget.service";

import type {
  AlertModel,
} from "../types/alert.types";

export class ForecastRiskDetectionService {
  async detectForecastRisk(
    organizationId: string,
  ): Promise<AlertModel[]> {
    const now = new Date();

    const budget =
      await budgetService.getCurrentMonthlyBudget(
        organizationId,
        now,
      );

    if (!budget) {
      return [];
    }

    const monthStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    const spend =
      await prisma.costSnapshot.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          snapshotDate: {
            gte: monthStart,
            lte: now,
          },
          account: {
            organizationId,
          },
        },
      });

    const currentSpend =
      spend._sum.totalCost ?? 0;

    const elapsedDays =
      Math.max(
        now.getDate(),
        1,
      );

    const daysInMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();

    const projectedSpend =
      (
        currentSpend /
        elapsedDays
      ) *
      daysInMonth;

    if (
      projectedSpend <=
      budget.amount
    ) {
      return [];
    }

    return [
      {
        id:
          "forecast-risk",

        type:
          "forecast_risk",

        severity:
          "critical",

        status:
          "active",

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
            projectedSpend.toFixed(2),
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