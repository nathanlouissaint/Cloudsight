import type {
  ForecastSummary,
} from "../types/forecast.types";

import type {
  HistoricalTrendPoint,
} from "./historical-trend.service";

export class ForecastConfidenceService {

  calculate(
    summary: ForecastSummary,
    historical: HistoricalTrendPoint[]
  ) {

    const completion =
      summary.elapsedDays /
      (
        summary.elapsedDays +
        summary.remainingDays
      );

    const spends =
      historical.map(point => point.spend);

    const mean =
      spends.length > 0
        ? spends.reduce(
            (sum, value) => sum + value,
            0
          ) / spends.length
        : summary.averageDailySpend;

    const variance =
      spends.length > 1
        ? spends.reduce(
            (sum, value) =>
              sum +
              Math.pow(value - mean, 2),
            0
          ) / spends.length
        : 0;

    const stdDev =
      Math.sqrt(variance);

    const coefficientOfVariation =
      mean > 0
        ? stdDev / mean
        : 0;

    const stability =
      Math.max(
        0,
        1 - coefficientOfVariation
      );

    const score =
      Math.min(
        95,
        Math.round(
          (
            completion * 0.40 +
            stability * 0.60
          ) * 100
        )
      );

    let level:
      | "Low"
      | "Medium"
      | "High";

    if (score >= 80) {
      level = "High";
    } else if (score >= 60) {
      level = "Medium";
    } else {
      level = "Low";
    }

    return {

      score,

      level,

      reason:
        level === "High"
          ? "Recent spending has remained stable, increasing forecast reliability."
          : level === "Medium"
          ? "Moderate spend variation reduces forecast certainty."
          : "High day-to-day spending volatility lowers forecast confidence."

    };

  }

}

export const forecastConfidenceService =
  new ForecastConfidenceService();
