import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { DashboardContract } from "../contracts/dashboard.contract";

type CloudServiceSummary = Awaited<
  ReturnType<typeof prisma.cloudService.findMany>
>[number];

interface ServiceBreakdownItem {
  name: string;
  spend: number;
  percentage: number;
}

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

    const serviceCosts =
      await prisma.costRecord.groupBy({
        by: ["serviceId"],
        _sum: {
          cost: true,
        },
        where: {
          usageDate: {
            gte: currentMonthStart,
          },
        },
        orderBy: {
          _sum: {
            cost: "desc",
          },
        },
      });

   const serviceIds =
  serviceCosts.map(
    (item: (typeof serviceCosts)[number]) =>
      item.serviceId
  );

    const services =
      await prisma.cloudService.findMany({
        where: {
          id: {
            in: serviceIds,
          },
        },
      });

    const serviceNameById = new Map(
      services.map(
        (service: CloudServiceSummary) => [
          service.id,
          service.name,
        ]
      )
    );

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
      today > 0
        ? currentMonthSpend / today
        : 0;

    const forecastedSpend =
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
      budget?.amount ?? 5000;

    const budgetUsage =
      budgetAmount > 0
        ? (currentMonthSpend / budgetAmount) * 100
        : 0;

    const totalSavings = 1240;

    const serviceBreakdown: ServiceBreakdownItem[] =
  serviceCosts.map(
    (item: (typeof serviceCosts)[number]) => {
        const spend =
          item._sum?.cost ?? 0;



        return {
          name:
            serviceNameById.get(item.serviceId) ??
            "No dominant service",

          spend: Number(
            spend.toFixed(2)
          ),

          percentage:
            currentMonthSpend > 0
              ? Number(
                  (
                    (spend /
                      currentMonthSpend) *
                    100
                  ).toFixed(1)
                )
              : 0,
        };
      });

    const topService =
  serviceBreakdown.length > 0
    ? serviceBreakdown[0].name
    : "No dominant cost driver";

    const response =
      DashboardContract.parse({
        overview: {
          forecast: Number(
            forecastedSpend.toFixed(2)
          ),
          budgetUsage: Number(
            budgetUsage.toFixed(1)
          ),
          confidence: 92,
          savings: totalSavings,
        },

        summary: {
          content: [
            `Current month spend is $${currentMonthSpend.toFixed(
              2
            )}.`,
            `Forecasted spend is $${forecastedSpend.toFixed(
              2
            )}.`,
            `${topService} is the current top cost driver.`,
          ],
        },

        costDrivers:
          serviceBreakdown
            .slice(0, 3)
            .map(
              (
                service: ServiceBreakdownItem
              ) => ({
                service: service.name,
                increase: 8,
                reason:
                  "Current month spend concentration",
              })
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
            title: "Budget Status",
            description:
              budgetUsage < 80
                ? "Current spend remains within budget thresholds."
                : "Current spend is approaching budget threshold.",
          },
          {
            title: "Top Service",
            description: `${topService} is currently driving the largest share of cloud spend.`,
          },
        ],

        anomalies: [
  {
    service: topService,
    impact:
      previousMonthSpend > 0
        ? `+${(
            ((currentMonthSpend -
              previousMonthSpend) /
              previousMonthSpend) *
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

        accounts: [
          {
            name: "Production",
            status: "Healthy",
          },
          {
            name: "Staging",
            status: "Healthy",
          },
          {
            name: "Development",
            status:
              budgetUsage > 80
                ? "Warning"
                : "Healthy",
          },
        ],

        forecastFactors: [
          {
            name:
              "Current Daily Run Rate",
            impact: `$${averageDailySpend.toFixed(
              2
            )}/day`,
          },
          {
            name:
              "Budget Utilization",
            impact: `${budgetUsage.toFixed(
              1
            )}%`,
          },
          {
            name:
              "Days Remaining",
            impact: `${daysInMonth - today}`,
          },
        ],

        services:
          serviceBreakdown,
      });

    return res
      .status(200)
      .json(response);
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