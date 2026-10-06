import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getOrganizationIdForUser } from "../services/organization-context.service";

import {
  AlertsContract,
} from "../contracts/alerts.contract";

import {
  AlertHistoryContract,
} from "../contracts/alert-history.contract";

import {
  alertService,
} from "../services/alert.service";

import {
  alertHistoryService,
} from "../services/alert-history.service";
import { logger } from "../config/logger";

type AlertHistoryItem = Awaited<
  ReturnType<typeof alertHistoryService.getRecentHistory>
>[number];

export async function getAlerts(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const alerts = await alertService.getAlerts(organizationId);

    return res
      .status(200)
      .json(
        AlertsContract.parse(alerts)
      );
  } catch (error) {
    logger.error({ err: error }, "Alerts error");

    return res
      .status(500)
      .json({
        message:
          "Failed to load alerts",
      });
  }
}

export async function getAlertHistory(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });
    const history = await alertHistoryService.getRecentHistory(organizationId);

    const response =
      AlertHistoryContract.parse(
        history.map(
          (item: AlertHistoryItem) => ({
            ...item,

            occurredAt:
              item.occurredAt.toISOString(),

            resolvedAt:
              item.resolvedAt
                ? item.resolvedAt.toISOString()
                : null,

            createdAt:
              item.createdAt.toISOString(),
          })
        )
      );

    return res
      .status(200)
      .json(response);
  } catch (error) {
    logger.error({ err: error }, "Alert history error");

    return res
      .status(500)
      .json({
        message:
          "Failed to load alert history",
      });
  }
}
