import type {
  Request,
  Response,
} from "express";

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

type AlertHistoryItem = Awaited<
  ReturnType<typeof alertHistoryService.getRecentHistory>
>[number];

export async function getAlerts(
  _req: Request,
  res: Response
) {
  try {
    const alerts =
      await alertService.getAlerts();

    return res
      .status(200)
      .json(
        AlertsContract.parse(alerts)
      );
  } catch (error) {
    console.error(
      "Alerts error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to load alerts",
      });
  }
}

export async function getAlertHistory(
  _req: Request,
  res: Response
) {
  try {
    const history =
      await alertHistoryService.getRecentHistory();

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
    console.error(
      "Alert history error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to load alert history",
      });
  }
}
