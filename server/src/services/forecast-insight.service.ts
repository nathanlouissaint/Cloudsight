import type {
  ForecastInsight,
  ForecastSummary,
  ServiceForecast,
} from "../types/forecast.types";

export class ForecastInsightService {

  build(
    summary: ForecastSummary,
    services: ServiceForecast[]
  ): ForecastInsight[] {

    const insights: ForecastInsight[] = [];

    if (!summary.onTrack) {

      insights.push({
        type: "budget",
        severity: "warning",
        title: "Budget Risk",
        message:
          `Forecast exceeds budget by $${Math.abs(
            summary.projectedVariance
          ).toFixed(2)}.`,
      });

    }

    const top =
      services[0];

    if (top) {

      insights.push({
        type: "service",
        severity: "info",
        title: "Top Cost Driver",
        message:
          `${top.service} is projected at $${top.projectedSpend.toFixed(2)} this month.`,
      });

    }

    if (
      summary.averageDailySpend >
      0
    ) {

      insights.push({
        type: "trend",
        severity: "info",
        title: "Run Rate",
        message:
          `Average daily spend is $${summary.averageDailySpend.toFixed(2)}.`,
      });

    }

    return insights;

  }

}

export const forecastInsightService =
  new ForecastInsightService();
