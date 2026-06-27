import type { ForecastSummary } from "../types/forecast.types";

export class ForecastExplanationService {
  build(summary: ForecastSummary): string {
    const variance = Math.abs(summary.projectedVariance).toFixed(2);

    return `Based on ${summary.elapsedDays} days of collected spend. Average daily spend is $${summary.averageDailySpend.toFixed(
      2
    )}. Projected monthly spend ${
      summary.onTrack ? "is under budget by" : "is over budget by"
    } $${variance}.`;
  }
}

export const forecastExplanationService =
  new ForecastExplanationService();
