import { Router } from "express";

import {
  getAccounts,
} from "../controllers/account.controller";

import {
  getAccountTrendController,
} from "../controllers/account-trend.controller";

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
  getAccounts,
);

router.get(
  "/:accountId/trends",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_READ,
  ),
  getAccountTrendController,
);

export default router;