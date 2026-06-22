import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../api/client";
import { forecastMock } from "../mocks/forecast.mock";
import { USE_MOCK_DATA } from "../config/features";
import { queryKeys } from "../queries/queryKeys";

import type { ForecastResponse } from "../types/forecast";

export function useForecastQuery() {
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
  });
}
