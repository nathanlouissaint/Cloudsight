import type { OrganizationRole } from "@prisma/client";

import type { AuthenticatedRequest } from "../auth/request.types";

export interface OrganizationContext {
  id: string;
  membershipId: string;
  role: OrganizationRole;
}

export interface OrganizationAuthenticatedRequest
  extends AuthenticatedRequest {
  organization?: OrganizationContext;
}