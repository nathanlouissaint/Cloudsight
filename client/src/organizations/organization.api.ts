import {
  apiRequest,
} from "../lib/apiClient";

import type {
  OrganizationMember,
  OrganizationMembersResponse,
  OrganizationRole,
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

interface OrganizationMemberResponse {
  member: OrganizationMember;
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

export function getOrganizationMembers():
  Promise<OrganizationMembersResponse> {
  return apiRequest<OrganizationMembersResponse>(
    "/organizations/current/members",
  );
}

export function addOrganizationMember(
  email: string,
  role: OrganizationRole,
): Promise<OrganizationMemberResponse> {
  return apiRequest<OrganizationMemberResponse>(
    "/organizations/current/members",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        role,
      }),
    },
  );
}

export function updateOrganizationMemberRole(
  membershipId: string,
  role: OrganizationRole,
): Promise<OrganizationMemberResponse> {
  return apiRequest<OrganizationMemberResponse>(
    `/organizations/current/members/${membershipId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role,
      }),
    },
  );
}

export function removeOrganizationMember(
  membershipId: string,
): Promise<void> {
  return apiRequest<void>(
    `/organizations/current/members/${membershipId}`,
    {
      method: "DELETE",
    },
  );
}
