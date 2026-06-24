import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface HistoricalTrend {
  date: string;
  spend: number;
}

export function useHistoricalTrends() {
  return useQuery({
    queryKey: ["historical-trends"],

    queryFn: async (): Promise<HistoricalTrend[]> => {
      const response =
        await apiRequest<any>(
          "/analytics/trends"
        );

      const grouped =
        new Map<string, number>();

      for (const row of response.trends) {
        const date =
          new Date(
            row.snapshotDate
          ).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          );

        grouped.set(
          date,
          (grouped.get(date) ?? 0) +
            row.totalCost
        );
      }

      return Array.from(
        grouped.entries()
      ).map(
        ([date, spend]) => ({
          date,
          spend: Number(
            spend.toFixed(2)
          ),
        })
      );
    },

    staleTime:
      1000 * 60 * 5,
  });
}
