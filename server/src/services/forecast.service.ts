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

interface ServiceSnapshot {
  serviceName: string;
  cost: number;
}

interface AccountSnapshot {
  accountId: string;
  totalCost: number;
  account: {
    accountName: string;
  };
}

interface ServiceGroup {
  total: number;
}

interface AccountGroup {
  total: number;
  name: string;
}

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
  await findCurrentMonthServiceSnapshots() as ServiceSnapshot[];

const accountSnapshots =
  await findCurrentMonthCostSnapshots() as AccountSnapshot[];

const currentMonthStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
);

const spend =
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
  spend._sum.cost ?? 0;

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
        (
          acc: Record<string, ServiceGroup>,
          row: ServiceSnapshot
        ) => {
          if (!acc[row.serviceName]) {
            acc[row.serviceName] = {
              total: 0,
            };
          }

          acc[row.serviceName].total +=
            row.cost;

          return acc;
        },
        {} as Record<string, ServiceGroup>
      );

    const serviceEntries =
      Object.entries(serviceGroups) as [
        string,
        ServiceGroup
      ][];

    const serviceForecasts:
      ServiceForecast[] =
      serviceEntries
        .map(
          ([service, value]) => ({
            service,

            projectedSpend:
              Number(
                (
                  (value.total /
                    Math.max(
                      elapsedDays,
                      1
                    )) *
                  daysInMonth
                ).toFixed(2)
              ),
          })
        )
        .sort(
          (
            a: ServiceForecast,
            b: ServiceForecast
          ) =>
            b.projectedSpend -
            a.projectedSpend
        );

    const accountGroups =
      accountSnapshots.reduce(
        (
          acc: Record<string, AccountGroup>,
          row: AccountSnapshot
        ) => {
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
        {} as Record<string, AccountGroup>
      );

    const accountValues =
      Object.values(accountGroups) as AccountGroup[];

    const accountForecasts:
      AccountForecast[] =
      accountValues
        .map(
          (account: AccountGroup) => ({
            account:
              account.name,

            projectedSpend:
              Number(
                (
                  (account.total /
                    Math.max(
                      elapsedDays,
                      1
                    )) *
                  daysInMonth
                ).toFixed(2)
              ),
          })
        )
        .sort(
          (
            a: AccountForecast,
            b: AccountForecast
          ) =>
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
