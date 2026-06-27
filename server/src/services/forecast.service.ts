import {
  findCurrentMonthServiceSnapshots,
} from "../repositories/service-cost-snapshot.repository";

import {
  findCurrentMonthCostSnapshots,
} from "../repositories/cost-snapshot.repository";

import { prisma } from "../config/prisma";

import { forecastConfidenceService } from "./forecast-confidence.service";
import { forecastProjectionService } from "./forecast-projection.service";
import { forecastGrowthDriverService } from "./forecast-growth-driver.service";
import { forecastExplanationService } from "./forecast-explanation.service";
import { historicalTrendService } from "./historical-trend.service";
import { forecastInsightService } from "./forecast-insight.service";

import type {
  ForecastModel,
  ForecastSummary,
  ServiceForecast,
  AccountForecast,
} from "../types/forecast.types";

export class ForecastService {

  async getForecast(): Promise<ForecastModel> {

    const now = new Date();

    const elapsedDays = now.getDate();

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const remainingDays =
      daysInMonth - elapsedDays;

    const historicalTrends =
      await historicalTrendService.getDailyTrend(
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ),
        now
      );

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

    const serviceSnapshots =
      await findCurrentMonthServiceSnapshots();

    const accountSnapshots =
      await findCurrentMonthCostSnapshots();

    const currentSpend =
      accountSnapshots.reduce(
        (sum, row) =>
          sum + row.totalCost,
        0
      );

    const averageDailySpend =
      currentSpend /
      Math.max(elapsedDays, 1);

    const projectedSpend =
      averageDailySpend *
      daysInMonth;

    const summary: ForecastSummary = {

      currentSpend:
        Number(
          currentSpend.toFixed(2)
        ),

      averageDailySpend:
        Number(
          averageDailySpend.toFixed(2)
        ),

      elapsedDays,

      remainingDays,

      projectedSpend:
        Number(
          projectedSpend.toFixed(2)
        ),

      budget:
        budget?.amount ?? 0,

      projectedVariance:
        Number(
          (
            (budget?.amount ?? 0) -
            projectedSpend
          ).toFixed(2)
        ),

      onTrack:
        projectedSpend <=
        (budget?.amount ?? 0),

    };

    const serviceGroups =
      serviceSnapshots.reduce(
        (acc, row) => {

          if (!acc[row.serviceName]) {

            acc[row.serviceName] = {
              total: 0,
            };

          }

          acc[row.serviceName].total +=
            row.cost;

          return acc;

        },
        {} as Record<
          string,
          { total: number }
        >
      );

    const serviceForecasts:
      ServiceForecast[] =
      Object.entries(
        serviceGroups
      ).map(
        ([service, value]) => ({

          service,

          projectedSpend:
            Number(
              (
                value.total /
                Math.max(
                  elapsedDays,
                  1
                ) *
                daysInMonth
              ).toFixed(2)
            ),

        })
      )
      .sort(
        (a, b) =>
          b.projectedSpend -
          a.projectedSpend
      );

    const accountGroups =
      accountSnapshots.reduce(
        (acc, row) => {

          if (!acc[row.accountId]) {

            acc[row.accountId] = {
              total: 0,
              name:
                row.account.accountName,
            };

          }

          acc[row.accountId].total +=
            row.totalCost;

          return acc;

        },
        {} as Record<
          string,
          {
            total: number;
            name: string;
          }
        >
      );

    const accountForecasts:
      AccountForecast[] =
      Object.values(
        accountGroups
      ).map(
        account => ({

          account:
            account.name,

          projectedSpend:
            Number(
              (
                account.total /
                Math.max(
                  elapsedDays,
                  1
                ) *
                daysInMonth
              ).toFixed(2)
            ),

        })
      )
      .sort(
        (a, b) =>
          b.projectedSpend -
          a.projectedSpend
      );

    return {

      summary,

      confidence:
        forecastConfidenceService.calculate(
          summary,
          historicalTrends
        ),

      projection:
        forecastProjectionService.build(
          summary,
          historicalTrends
        ),

      growthDrivers:
        forecastGrowthDriverService.build(
          serviceForecasts
        ),

      explanation:
        forecastExplanationService.build(
          summary
        ),

      insights:
        forecastInsightService.build(
          summary,
          serviceForecasts
        ),

      serviceForecasts,

      accountForecasts,

    };

  }

}

export const forecastService =
  new ForecastService();
