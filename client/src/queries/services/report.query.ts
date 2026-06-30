import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
import { USE_MOCK_DATA } from "../../config/features";
import { reportMock } from "../../mocks/reports.mock";
import { queryKeys } from "../queryKeys";

import type { ReportResponse } from "../../types/report";

async function fetchReport(): Promise<ReportResponse> {
  if (USE_MOCK_DATA) {
    return reportMock;
  }

  return apiRequest<ReportResponse>(
    "/reports"
  );
}

export function useReportQuery() {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: fetchReport,
    staleTime: 1000 * 60 * 5,
  });
}
