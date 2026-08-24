import {
  apiRequest,
} from "../lib/apiClient";

import type {
  OrganizationSummary,
  OrganizationsResponse,
} from "./types";

export interface CurrentOrganization
  extends OrganizationSummary {
  createdAt: string;
  updatedAt: string;
}

interface CurrentOrganizationResponse {
  organization: CurrentOrganization;
}

interface CreateOrganizationResponse {
  organization: OrganizationSummary;
}

interface UpdateOrganizationResponse {
  organization: Omit<
    CurrentOrganization,
    "role" | "membershipId"
  >;
}

export function getOrganizations():
  Promise<OrganizationsResponse> {
  return apiRequest<OrganizationsResponse>(
    "/organizations",
  );
}

export function getCurrentOrganization():
  Promise<CurrentOrganizationResponse> {
  return apiRequest<CurrentOrganizationResponse>(
    "/organizations/current",
  );
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

export function updateCurrentOrganization(
  name: string,
): Promise<UpdateOrganizationResponse> {
  return apiRequest<UpdateOrganizationResponse>(
    "/organizations/current",
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
      }),
    },
  );
}