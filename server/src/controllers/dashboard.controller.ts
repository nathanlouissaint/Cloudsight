import type { Response } from "express";
import { prisma } from "../config/prisma";
import { DashboardContract } from "../contracts/dashboard.contract";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";

export async function getDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const [current, previous, records, budget, accounts] = await Promise.all([
      prisma.costSnapshot.aggregate({ _sum: { totalCost: true }, where: { snapshotDate: { gte: currentMonthStart, lte: now }, account: { organizationId } } }),
      prisma.costSnapshot.aggregate({ _sum: { totalCost: true }, where: { snapshotDate: { gte: previousMonthStart, lte: previousMonthEnd }, account: { organizationId } } }),
      prisma.serviceCostSnapshot.findMany({ where: { snapshotDate: { gte: currentMonthStart, lte: now }, account: { organizationId } } }),
      prisma.budget.findUnique({ where: { organizationId_year_month: { organizationId, year: now.getFullYear(), month: now.getMonth() + 1 } } }),
      prisma.cloudAccount.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } }),
    ]);
    const currentMonthSpend = current._sum.totalCost ?? 0;
    const previousMonthSpend = previous._sum.totalCost ?? 0;
    const totals = new Map<string, number>();
    for (const record of records) totals.set(record.serviceName, (totals.get(record.serviceName) ?? 0) + record.cost);
    const serviceBreakdown = [...totals.entries()]
      .map(([name, spend]) => ({ name, spend: Number(spend.toFixed(2)), percentage: currentMonthSpend > 0 ? Number(((spend / currentMonthSpend) * 100).toFixed(1)) : 0 }))
      .sort((a, b) => b.spend - a.spend);
    const topService = serviceBreakdown[0]?.name ?? "No dominant cost driver";
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const averageDailySpend = currentMonthSpend / Math.max(now.getDate(), 1);
    const forecastedSpend = averageDailySpend * daysInMonth;
    const budgetAmount = budget?.amount ?? 0;
    const budgetUsage = budgetAmount > 0 ? (currentMonthSpend / budgetAmount) * 100 : 0;

    return res.status(200).json(DashboardContract.parse({
      overview: { forecast: Number(forecastedSpend.toFixed(2)), budgetUsage: Number(budgetUsage.toFixed(1)), confidence: 92, savings: 1240 },
      summary: { content: [`Current month spend is $${currentMonthSpend.toFixed(2)}.`, `Forecasted spend is $${forecastedSpend.toFixed(2)}.`, `${topService} is the current top cost driver.`] },
      costDrivers: serviceBreakdown.slice(0, 3).map((service) => ({ service: service.name, increase: 8, reason: "Current month spend concentration" })),
      optimization: [],
      insights: [
        { title: "Budget Status", description: budgetAmount <= 0 ? "No monthly budget has been configured." : budgetUsage < 80 ? "Current spend remains within budget thresholds." : "Current spend is approaching budget threshold." },
        { title: "Top Service", description: `${topService} is currently driving the largest share of cloud spend.` },
      ],
      anomalies: [{ service: topService, impact: previousMonthSpend > 0 ? `${((currentMonthSpend - previousMonthSpend) / previousMonthSpend * 100).toFixed(1)}%` : "No historical comparison", severity: currentMonthSpend > previousMonthSpend ? "warning" : "healthy" }],
      accounts: accounts.map((account) => ({ name: account.accountName, status: account.connectionStatus })),
      forecastFactors: [
        { name: "Current Daily Run Rate", impact: `$${averageDailySpend.toFixed(2)}/day` },
        { name: "Budget Utilization", impact: `${budgetUsage.toFixed(1)}%` },
        { name: "Days Remaining", impact: `${Math.max(daysInMonth - now.getDate(), 0)}` },
      ],
      services: serviceBreakdown,
    }));
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return res.status(500).json({ message: "Failed to load dashboard summary" });
  }
}
