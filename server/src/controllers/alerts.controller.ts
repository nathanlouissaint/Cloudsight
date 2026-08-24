import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

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
  ReturnType<
    typeof alertHistoryService.getRecentHistory
  >
>[number];

function requireOrganizationId(
  req: OrganizationAuthenticatedRequest,
  res: Response,
): string | null {
  const organizationId =
    req.organization?.id;

  if (!organizationId) {
    res.status(400).json({
      message:
        "Organization context is required",
    });

    return null;
  }

  return organizationId;
}

export async function getAlerts(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const alerts =
      await alertService.getAlerts(
        organizationId,
      );

    return res
      .status(200)
      .json(
        AlertsContract.parse(
          alerts,
        ),
      );
  } catch (error) {
    console.error(
      "Alerts error:",
      error,
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
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  const organizationId =
    requireOrganizationId(
      req,
      res,
    );

  if (!organizationId) {
    return;
  }

  try {
    const history =
      await alertHistoryService.getRecentHistory(
        organizationId,
      );

    const response =
      AlertHistoryContract.parse(
        history.map(
          (
            item:
              AlertHistoryItem,
          ) => ({
            ...item,

            occurredAt:
              item.occurredAt
                .toISOString(),

            resolvedAt:
              item.resolvedAt
                ? item.resolvedAt
                    .toISOString()
                : null,

            createdAt:
              item.createdAt
                .toISOString(),
          }),
        ),
      );

    return res
      .status(200)
      .json(response);
  } catch (error) {
    console.error(
      "Alert history error:",
      error,
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to load alert history",
      });
  }
}