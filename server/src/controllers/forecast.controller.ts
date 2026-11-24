import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";

import {
  ForecastContract,
} from "../contracts/forecast.contract";

import {
  forecastService,
} from "../services/forecast.service";
import { getOrganizationIdForUser } from "../services/organization-context.service";
import { logger } from "../config/logger";

export async function getForecast(
  req: AuthenticatedRequest,
  res: Response
) {

  try {

    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const organizationId = await getOrganizationIdForUser(userId);
    if (!organizationId) return res.status(403).json({ message: "No organization is associated with this account." });

    const forecast = await forecastService.getForecast(organizationId);

    const response =
      ForecastContract.parse(
        forecast
      );

    return res
      .status(200)
      .json(response);

  } catch (error) {

    logger.error({ err: error }, "Forecast error");

    return res
      .status(500)
      .json({
        message:
          "Failed to load forecast",
      });

  }

}
