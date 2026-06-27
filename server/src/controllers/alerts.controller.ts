import type {
  Request,
  Response,
} from "express";

import {
  AlertsContract,
} from "../contracts/alerts.contract";

import {
  alertService,
} from "../services/alert.service";

export async function getAlerts(
  _req: Request,
  res: Response
) {
  try {

    const alerts =
      await alertService.getAlerts();

    const response =
      AlertsContract.parse(
        alerts
      );

    return res
      .status(200)
      .json(response);

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
