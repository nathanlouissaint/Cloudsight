import type { Response } from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  getAccountSummary,
} from "../services/account-aggregation.service";

export async function getAccounts(
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

    const now = new Date();

    const startDate = req.query.startDate
      ? new Date(
          String(req.query.startDate),
        )
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        );

    const endDate = req.query.endDate
      ? new Date(
          String(req.query.endDate),
        )
      : now;

    const result = await getAccountSummary(
      req.organization.id,
      startDate,
      endDate,
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
      error,
    );

    res.status(500).json({
      message:
        "Failed to load account analytics",
    });
  }
}