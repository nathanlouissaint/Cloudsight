import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  ForecastContract,
} from "../contracts/forecast.contract";

import {
  forecastService,
} from "../services/forecast.service";

export async function getForecast(
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
    const forecast =
      await forecastService.getForecast(
        organizationId,
      );

    const response =
      ForecastContract.parse(
        forecast,
      );

    return res
      .status(200)
      .json(response);
  } catch (error) {
    console.error(
      "Forecast error:",
      error,
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to load forecast",
      });
  }
}