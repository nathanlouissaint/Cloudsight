import type { Response } from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import { prisma } from "../config/prisma";

import {
  DashboardContract,
} from "../contracts/dashboard.contract";

import {
  budgetService,
} from "../services/budget.service";

interface ServiceBreakdownItem {
  name: string;
  spend: number;
  percentage: number;
}

export async function getDashboardSummary(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    req.organization?.id;

  if (!organizationId) {
    return res.status(400).json({
      message:
        "Organization context is required",
    });
  }

  try {
    const now = new Date();

    const currentMonthStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    const previousMonthStart =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );

    const previousMonthEnd =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );

    const currentMonthSpendResult =
      await prisma.costSnapshot.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          snapshotDate: {
            gte: currentMonthStart,
            lte: now,
          },
          account: {
            organizationId,
          },
        },
      });

    const previousMonthSpendResult =
      await prisma.costSnapshot.aggregate({
        _sum: {
          totalCost: true,
        },
        where: {
          snapshotDate: {
            gte: previousMonthStart,
            lte: previousMonthEnd,
          },
          account: {
            organizationId,
          },
        },
      });

    const serviceRecords =
      await prisma.serviceCostSnapshot.findMany({
        where: {
          snapshotDate: {
            gte: currentMonthStart,
            lte: now,
          },
          account: {
            organizationId,
          },
        },
      });

    const accounts =
      await prisma.cloudAccount.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    const budget =
      await budgetService.getCurrentMonthlyBudget(
        organizationId,
        now,
      );

    const currentMonthSpend =
      currentMonthSpendResult
        ._sum
        .totalCost ?? 0;

    const previousMonthSpend =
      previousMonthSpendResult
        ._sum
        .totalCost ?? 0;

    const today =
      now.getDate();

    const daysInMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();

    const averageDailySpend =
      today > 0
        ? currentMonthSpend / today
        : 0;

    const forecastedSpend =
      averageDailySpend *
      daysInMonth;

    const budgetAmount =
      budget?.amount ?? 0;

    const budgetUsage =
      budgetAmount > 0
        ? (
            currentMonthSpend /
            budgetAmount
          ) * 100
        : 0;

    const totalSavings = 1240;

    const serviceTotals =
      new Map<string, number>();

    for (
      const record of serviceRecords
    ) {
      serviceTotals.set(
        record.serviceName,
        (
          serviceTotals.get(
            record.serviceName,
          ) ?? 0
        ) + record.cost,
      );
    }

    const serviceBreakdown:
      ServiceBreakdownItem[] =
      Array.from(
        serviceTotals.entries(),
      )
        .map(
          ([name, spend]) => ({
            name,
            spend:
              Number(
                spend.toFixed(2),
              ),
            percentage:
              currentMonthSpend > 0
                ? Number(
                    (
                      (
                        spend /
                        currentMonthSpend
                      ) *
                      100
                    ).toFixed(1),
                  )
                : 0,
          }),
        )
        .sort(
          (a, b) =>
            b.spend - a.spend,
        );

    const topService =
      serviceBreakdown.length > 0
        ? serviceBreakdown[0].name
        : "No dominant cost driver";

    const response =
      DashboardContract.parse({
        overview: {
          forecast:
            Number(
              forecastedSpend.toFixed(
                2,
              ),
            ),

          budgetUsage:
            Number(
              budgetUsage.toFixed(1),
            ),

          confidence: 92,

          savings:
            totalSavings,
        },

        summary: {
          content: [
            `Current month spend is $${currentMonthSpend.toFixed(
              2,
            )}.`,
            `Forecasted spend is $${forecastedSpend.toFixed(
              2,
            )}.`,
            `${topService} is the current top cost driver.`,
          ],
        },

        costDrivers:
          serviceBreakdown
            .slice(0, 3)
            .map(
              (
                service:
                  ServiceBreakdownItem,
              ) => ({
                service:
                  service.name,

                increase: 8,

                reason:
                  "Current month spend concentration",
              }),
            ),

        optimization: [
          {
            resource:
              "Idle EC2 Instances",
            savings: 420,
            priority: "High",
          },
          {
            resource:
              "Unused EBS Volumes",
            savings: 190,
            priority: "Medium",
          },
          {
            resource:
              "Savings Plan Coverage",
            savings: 630,
            priority: "High",
          },
        ],

        insights: [
          {
            title:
              "Budget Status",

            description:
              budgetAmount <= 0
                ? "No monthly budget has been configured."
                : budgetUsage < 80
                  ? "Current spend remains within budget thresholds."
                  : "Current spend is approaching budget threshold.",
          },
          {
            title:
              "Top Service",

            description:
              `${topService} is currently driving the largest share of cloud spend.`,
          },
        ],

        anomalies: [
          {
            service:
              topService,

            impact:
              previousMonthSpend > 0
                ? `+${(
                    (
                      (
                        currentMonthSpend -
                        previousMonthSpend
                      ) /
                      previousMonthSpend
                    ) *
                    100
                  ).toFixed(1)}%`
                : "No historical comparison",

            severity:
              currentMonthSpend >
              previousMonthSpend
                ? "warning"
                : "healthy",
          },
        ],

        accounts:
          accounts.map(
            (account) => ({
              name:
                account.accountName,

              status:
                budgetUsage > 80
                  ? "Warning"
                  : "Healthy",
            }),
          ),

        forecastFactors: [
          {
            name:
              "Current Daily Run Rate",

            impact:
              `$${averageDailySpend.toFixed(
                2,
              )}/day`,
          },
          {
            name:
              "Budget Utilization",

            impact:
              `${budgetUsage.toFixed(
                1,
              )}%`,
          },
          {
            name:
              "Days Remaining",

            impact:
              `${
                daysInMonth -
                today
              }`,
          },
        ],
      });

    return res
      .status(200)
      .json(response);
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load dashboard summary",
    });
  }
}