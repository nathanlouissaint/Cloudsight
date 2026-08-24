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
  refreshOrganizations: () => Promise<void>;
}
