import type {
  ForecastProjectionPoint,
  ForecastSummary,
} from "../types/forecast.types";

import type {
  HistoricalTrendPoint,
} from "./historical-trend.service";

import {
  forecastTrendService,
} from "./forecast-trend.service";

export class ForecastProjectionService {

  build(
    summary: ForecastSummary,
    historical: HistoricalTrendPoint[]
  ): ForecastProjectionPoint[] {

    const today = new Date();

    const projection: ForecastProjectionPoint[] = [];

    const window =
      historical.slice(-7);

    const movingAverage =
      window.length > 0
        ? window.reduce(
            (sum, point) =>
              sum + point.spend,
            0
          ) / window.length
        : summary.averageDailySpend;

    const trend =
      forecastTrendService.analyze(
        historical
      );

    let running =
      summary.currentSpend;

    for (
      let i = 1;
      i <= summary.remainingDays;
      i++
    ) {

      running +=
        movingAverage +
        trend.slope;

      const date =
        new Date(today);

      date.setDate(
        today.getDate() + i
      );

      projection.push({

        day: i,

        date:
          date.toISOString(),

        projectedSpend:
          Number(
            running.toFixed(2)
          ),

      });

    }

    return projection;

  }

}

export const forecastProjectionService =
  new ForecastProjectionService();
