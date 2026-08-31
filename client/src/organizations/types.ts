export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MEMBER"
  | "VIEWER";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  membershipId: string;
}

export interface OrganizationMemberUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface OrganizationMember {
  id: string;
  role: OrganizationRole;
  createdAt: string;
  user: OrganizationMemberUser;
}

export interface OrganizationMembersResponse {
  members: OrganizationMember[];
}

export interface OrganizationInvitationInvitedBy {
  id: string;
  email: string;
  name: string | null;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedByUserId: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  invitedByUser: OrganizationInvitationInvitedBy;
}

export interface OrganizationInvitationsResponse {
  invitations: OrganizationInvitation[];
}

export interface OrganizationInvitationPreview {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: OrganizationRole;
  expiresAt: string;
}

export interface OrganizationInvitationPreviewResponse {
  invitation: OrganizationInvitationPreview;
}

export interface OrganizationsResponse {
  organizations: OrganizationSummary[];
}

export interface OrganizationContextType {
  organizations: OrganizationSummary[];
  currentOrganization: OrganizationSummary | null;
  currentOrganizationId: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  selectOrganization: (
    organizationId: string,
  ) => Promise<void>;
  refreshOrganizations: (
    preferredOrganizationId?: string,
  ) => Promise<OrganizationSummary[]>;
}
