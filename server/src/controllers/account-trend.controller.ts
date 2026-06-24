import type {
  Request,
  Response,
} from "express";

import {
  getAccountTrend,
} from "../services/account-trend.service";

export async function getAccountTrendController(
  req: Request,
  res: Response
) {
  try {
    const accountId =
      String(req.params.accountId);

    const endDate =
      req.query.endDate
        ? new Date(
            String(req.query.endDate)
          )
        : new Date();

    const startDate =
      req.query.startDate
        ? new Date(
            String(req.query.startDate)
          )
        : new Date(
            Date.now() -
              30 *
                24 *
                60 *
                60 *
                1000
          );

    const result =
      await getAccountTrend(
        accountId,
        startDate,
        endDate
      );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to load account trend",
    });
  }
}
