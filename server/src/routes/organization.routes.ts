import {
  Router,
} from "express";

import {
  getOrganizations,
  getCurrentOrganization,
  getOrganizationMembers,
  updateCurrentOrganization,
  createOrganizationMember,
  updateOrganizationMemberRole,
  deleteOrganizationMember,
} from "../controllers/organization/organization.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

import {
  requireOrganizationContext,
} from "../middleware/organization-context.middleware";

import {
  requireOrganizationPermission,
} from "../middleware/organization-role.middleware";

import {
  ORGANIZATION_PERMISSIONS,
} from "../authz/organization.permissions";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getOrganizations,
);

router.get(
  "/current",
  authenticateToken,
  requireOrganizationContext,
  getCurrentOrganization,
);

router.get(
  "/current/members",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_MANAGE,
  ),
  getOrganizationMembers,
);

router.patch(
  "/current",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.ORGANIZATION_MANAGE,
  ),
  updateCurrentOrganization,
);

router.post(
  "/current/members",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_MANAGE,
  ),
  createOrganizationMember,
);

router.patch(
  "/current/members/:membershipId",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_MANAGE,
  ),
  updateOrganizationMemberRole,
);

router.delete(
  "/current/members/:membershipId",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.MEMBERS_MANAGE,
  ),
  deleteOrganizationMember,
);

export default router;
