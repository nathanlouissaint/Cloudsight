import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";

import {
  getAccountTrend,
} from "../services/account-trend.service";
import { logger } from "../config/logger";

export async function getAccountTrendController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
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
        organizationId,
        accountId,
        startDate,
        endDate
      );

    res.status(200).json(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to load account trend");

    res.status(500).json({
      message:
        "Failed to load account trend",
    });
  }
}
