import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { USE_MOCK_DATA } from "../../config/features";
import { forecastMock } from "../../mocks/forecast.mock";
import { queryKeys } from "../queryKeys";

import type { ForecastResponse } from "../../types/forecast";

async function fetchForecast(): Promise<ForecastResponse> {
  if (USE_MOCK_DATA) {
    return forecastMock;
  }

  return apiRequest<ForecastResponse>(
    "/forecast"
  );
}

export function useForecastQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.forecast(
      currentOrganizationId,
    ),
    queryFn: fetchForecast,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
