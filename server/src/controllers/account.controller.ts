import type { Request, Response } from "express";
import { getAccountSummary } from "../services/account-aggregation.service";

export async function getAccounts(
  req: Request,
  res: Response
) {
  try {
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : new Date();

    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        );

    const result = await getAccountSummary(
      startDate,
      endDate
    );

    res.status(200).json({
      startDate,
      endDate,
      accountCount: result.length,
      accounts: result,
    });
  } catch (error) {
    console.error(
      "Failed to load account analytics:",
      error
    );

    res.status(500).json({
      message: "Failed to load account analytics",
    });
  }
}
