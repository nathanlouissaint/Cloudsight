import { useForecastQuery } from "../queries/services/forecast.query";

export function useForecast() {
  return useForecastQuery();
}
