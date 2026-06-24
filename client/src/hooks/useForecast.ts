import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { USE_MOCK_DATA } from "../config/features";
import { forecastMock } from "../mocks/forecast.mock";
import { queryKeys } from "../lib/queryKeys";
import type { ForecastResponse } from "../types/forecast";

export function useForecast() {
  return useQuery({
    queryKey: queryKeys.forecast,

    queryFn: async (): Promise<ForecastResponse> => {
      if (USE_MOCK_DATA) {
        return forecastMock;
      }

      return apiRequest<ForecastResponse>(
        "/forecast"
      );
    },

    staleTime: 1000 * 60 * 5,
  });
}
