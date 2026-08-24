import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../lib/apiClient";
import { useOrganization } from "../../organizations/useOrganization";
import { queryKeys } from "../queryKeys";

import type {
  ServicesResponse,
} from "../../types/services";

async function fetchServices(): Promise<ServicesResponse> {
  return apiRequest<ServicesResponse>(
    "/services"
  );
}

export function useServicesQuery() {
  const {
    currentOrganizationId,
  } = useOrganization();

  return useQuery({
    queryKey: queryKeys.services(
      currentOrganizationId,
    ),
    queryFn: fetchServices,
    enabled: currentOrganizationId !== null,
    staleTime: 1000 * 60 * 5,
  });
}
