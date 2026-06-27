import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface HistoricalTrend {
  date: string;
  spend: number;
}

interface TrendsResponse {
  trends: HistoricalTrend[];
}

export function useHistoricalTrends() {
  return useQuery({
    queryKey: ["historical-trends"],

    queryFn: async (): Promise<HistoricalTrend[]> => {
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
    },

    staleTime: 1000 * 60 * 5,
  });
}
