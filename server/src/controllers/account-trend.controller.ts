import type { Response } from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  getAccountTrend,
} from "../services/account-trend.service";

export async function getAccountTrendController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.organization) {
      res.status(400).json({
        message:
          "Organization context is required",
      });
      return;
    }

    const accountId =
      String(req.params.accountId);

    const endDate = req.query.endDate
      ? new Date(
          String(req.query.endDate),
        )
      : new Date();

    const startDate = req.query.startDate
      ? new Date(
          String(req.query.startDate),
        )
      : new Date(
          Date.now() -
            30 *
              24 *
              60 *
              60 *
              1000,
        );

    const result =
      await getAccountTrend(
        req.organization.id,
        accountId,
        startDate,
        endDate,
      );

    if (!result) {
      res.status(404).json({
        message: "Account not found",
      });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Failed to load account trend:",
      error,
    );

    res.status(500).json({
      message:
        "Failed to load account trend",
    });
  }
}