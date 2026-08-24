import {
  apiRequest,
} from "../lib/apiClient";

import type {
  OrganizationSummary,
  OrganizationsResponse,
} from "./types";

export function getOrganizations():
  Promise<OrganizationsResponse> {
  return apiRequest<OrganizationsResponse>(
    "/organizations",
  );
}

interface CreateOrganizationResponse {
  organization: OrganizationSummary;
}

export function createOrganization(
  name: string,
): Promise<CreateOrganizationResponse> {
  return apiRequest<CreateOrganizationResponse>(
    "/organizations",
    {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
    },
  );
}
