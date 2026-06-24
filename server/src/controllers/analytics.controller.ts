import type { Request, Response } from "express";
import { getHistoricalCostTrends } from "../services/analytics.service";

export async function getTrends(req: Request, res: Response) {
  try {
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : new Date();

    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await getHistoricalCostTrends(startDate, endDate);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load historical analytics",
    });
  }
}
