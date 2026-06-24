import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { queryKeys } from "../lib/queryKeys";
import type { ReportResponse } from "../types/report";

export function useReport() {
  return useQuery({
    queryKey: queryKeys.reports,

    queryFn: async (): Promise<ReportResponse> =>
      apiRequest<ReportResponse>("/reports"),

    staleTime: 1000 * 60 * 5,
  });
}
