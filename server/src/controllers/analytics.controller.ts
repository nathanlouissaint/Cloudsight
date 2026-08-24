import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  getHistoricalCostTrends,
} from "../services/analytics.service";

export async function getTrends(
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
    const endDate =
      req.query.endDate
        ? new Date(
            String(
              req.query.endDate,
            ),
          )
        : new Date();

    const startDate =
      req.query.startDate
        ? new Date(
            String(
              req.query.startDate,
            ),
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
      await getHistoricalCostTrends(
        organizationId,
        startDate,
        endDate,
      );

    return res
      .status(200)
      .json(result);
  } catch (error) {
    console.error(
      "Historical analytics error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to load historical analytics",
    });
  }
}