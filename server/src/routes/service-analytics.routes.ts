import { Router } from "express";

import {
  getServices,
  getTopServiceDrivers,
  getServiceTrends,
} from "../controllers/service-analytics.controller";

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
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getServices,
);

router.get(
  "/top-drivers",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getTopServiceDrivers,
);

router.get(
  "/:serviceName/trends",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getServiceTrends,
);

export default router;