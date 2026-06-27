import type {
  HistoricalTrendPoint,
} from "./historical-trend.service";

export interface ForecastTrend {

  slope: number;

  direction:
    | "up"
    | "down"
    | "flat";

}

export class ForecastTrendService {

  analyze(
    historical: HistoricalTrendPoint[]
  ): ForecastTrend {

    if (historical.length < 2) {

      return {
        slope: 0,
        direction: "flat",
      };

    }

    const window =
      historical.slice(-7);

    const first =
      window[0].spend;

    const last =
      window[window.length - 1].spend;

    const slope =
      (last - first) /
      Math.max(window.length - 1, 1);

    let direction:
      | "up"
      | "down"
      | "flat";

    if (slope > 2) {

      direction = "up";

    } else if (slope < -2) {

      direction = "down";

    } else {

      direction = "flat";

    }

    return {

      slope:
        Number(
          slope.toFixed(2)
        ),

      direction,

    };

  }

}

export const forecastTrendService =
  new ForecastTrendService();
