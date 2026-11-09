import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";
import { getAccountSummary } from "../services/account-aggregation.service";
import { logger } from "../config/logger";

export async function getAccounts(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const now = new Date();

    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : now;

    const result = await getAccountSummary(
      organizationId,
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
    logger.error({ err: error }, "Failed to load account analytics");

    res.status(500).json({
      message: "Failed to load account analytics",
    });
  }
}
