import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { queryKeys } from "../queryKeys";

export interface HistoricalTrend {
  date: string;
  spend: number;
}

interface TrendsResponse {
  trends: HistoricalTrend[];
}

async function fetchHistoricalTrends(): Promise<HistoricalTrend[]> {
  const response =
    await apiRequest<TrendsResponse>(
      "/analytics/trends"
    );

  return response.trends.map((trend) => ({
    date: new Date(trend.date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    ),
    spend: trend.spend,
  }));
}

export function useHistoricalTrendsQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.historicalTrends(
      currentOrganizationId,
    ),
    queryFn: fetchHistoricalTrends,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
