import type {
  GrowthDriver,
  ServiceForecast,
} from "../types/forecast.types";

export class ForecastGrowthDriverService {

  build(
    forecasts: ServiceForecast[]
  ): GrowthDriver[] {

    return forecasts
      .sort(
        (a, b) =>
          b.projectedSpend -
          a.projectedSpend
      )
      .slice(0, 5)
      .map(service => ({
        name: service.service,
        impact: Number(
          service.projectedSpend.toFixed(2)
        ),
        direction: "up",
      }));

  }

}

export const forecastGrowthDriverService =
  new ForecastGrowthDriverService();
