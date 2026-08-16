import { Router } from "express";

import {
  getAwsCosts,
} from "../controllers/aws.controller";

import {
  collectCostsController,
} from "../controllers/collection.controller";

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
  "/cost-explorer",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getAwsCosts,
);

router.post(
  "/collect",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.CLOUD_ACCOUNTS_WRITE,
  ),
  collectCostsController,
);

export default router;