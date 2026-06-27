import type {
  Request,
  Response,
} from "express";

import {
  ForecastContract,
} from "../contracts/forecast.contract";

import {
  forecastService,
} from "../services/forecast.service";

export async function getForecast(
  _req: Request,
  res: Response
) {

  try {

    const forecast =
      await forecastService.getForecast();

    const response =
      ForecastContract.parse(
        forecast
      );

    return res
      .status(200)
      .json(response);

  } catch (error) {

    console.error(
      "Forecast error:",
      error
    );

    return res
      .status(500)
      .json({
        message:
          "Failed to load forecast",
      });

  }

}
