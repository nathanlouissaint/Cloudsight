import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
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
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.reports(
      currentOrganizationId,
    ),
    queryFn: fetchReport,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
