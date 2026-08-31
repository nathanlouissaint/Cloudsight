import {
  Router,
} from "express";

import {
  createCloudAccountController,
  disconnectCloudAccountController,
  getCloudAccounts,
  reconnectCloudAccountController,
  updateCloudAccountController,
} from "../controllers/cloud-account.controller";

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
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_READ,
  ),
  getCloudAccounts,
);

router.post(
  "/",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_WRITE,
  ),
  createCloudAccountController,
);

router.patch(
  "/:accountId",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_WRITE,
  ),
  updateCloudAccountController,
);

router.post(
  "/:accountId/disconnect",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_WRITE,
  ),
  disconnectCloudAccountController,
);

router.post(
  "/:accountId/reconnect",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_WRITE,
  ),
  reconnectCloudAccountController,
);

export default router;
