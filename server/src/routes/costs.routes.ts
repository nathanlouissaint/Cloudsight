import { Router } from "express";

import {
  getCostTrends,
  getServiceBreakdown,
} from "../controllers/costs.controller";

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
  "/trends",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getCostTrends,
);

router.get(
  "/services",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.COSTS_READ,
  ),
  getServiceBreakdown,
);

export default router;