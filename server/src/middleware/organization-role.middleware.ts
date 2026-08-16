import type {
  NextFunction,
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  organizationRoleHasPermission,
} from "../authz/organization.permissions";

import type {
  OrganizationPermission,
} from "../authz/organization.permissions";

export function requireOrganizationPermission(
  permission: OrganizationPermission,
) {
  return function organizationPermissionMiddleware(
    req: OrganizationAuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void {
    const organization =
      req.organization;

    if (!organization) {
      res.status(400).json({
        message:
          "Organization context is required",
      });

      return;
    }

    if (
      !organizationRoleHasPermission(
        organization.role,
        permission,
      )
    ) {
      res.status(403).json({
        message:
          "You do not have permission to perform this action",
      });

      return;
    }

    next();
  };
}