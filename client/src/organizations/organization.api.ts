import {
  apiRequest,
} from "../lib/apiClient";

import type {
  OrganizationInvitation,
  OrganizationInvitationPreviewResponse,
  OrganizationInvitationsResponse,
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

interface OrganizationInvitationResponse {
  invitation: OrganizationInvitation;
}

interface AcceptOrganizationInvitationResponse {
  message: string;
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


export function getOrganizationInvitations():
  Promise<OrganizationInvitationsResponse> {
  return apiRequest<OrganizationInvitationsResponse>(
    "/organizations/current/invitations",
  );
}

export function createOrganizationInvitation(
  email: string,
  role: OrganizationRole,
): Promise<OrganizationInvitationResponse> {
  return apiRequest<OrganizationInvitationResponse>(
    "/organizations/current/invitations",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        role,
      }),
    },
  );
}

export function revokeOrganizationInvitation(
  invitationId: string,
): Promise<void> {
  return apiRequest<void>(
    `/organizations/current/invitations/${invitationId}`,
    {
      method: "DELETE",
    },
  );
}

export function getOrganizationInvitationPreview(
  token: string,
): Promise<OrganizationInvitationPreviewResponse> {
  return apiRequest<OrganizationInvitationPreviewResponse>(
    `/organization-invitations/${encodeURIComponent(token)}`,
  );
}

export function acceptOrganizationInvitation(
  token: string,
): Promise<AcceptOrganizationInvitationResponse> {
  return apiRequest<AcceptOrganizationInvitationResponse>(
    `/organization-invitations/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
    },
  );
}
