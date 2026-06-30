import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../../api/client";
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
  return useQuery({
    queryKey: queryKeys.services,
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });
}
