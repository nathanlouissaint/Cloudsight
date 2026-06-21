import type { Request, Response } from "express";

export async function getDashboardSummary(
  _req: Request,
  res: Response
) {
  return res.json({
    currentMonthSpend: 4123.5,
    previousMonthSpend: 3780.22,
    forecastedSpend: 4980.75,
    budgetUsage: 82.4,
  });
}