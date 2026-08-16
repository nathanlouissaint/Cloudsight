import { Router } from "express";

import {
  createNote,
  exportCsv,
  getExecutiveReport,
  getNotes,
  removeNote,
  updateNote,
} from "../controllers/reports.controller";

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
    ORGANIZATION_PERMISSIONS.REPORTS_READ,
  ),
  getExecutiveReport,
);

router.get(
  "/export/csv",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.REPORTS_READ,
  ),
  exportCsv,
);

router.get(
  "/notes",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.REPORTS_READ,
  ),
  getNotes,
);

router.post(
  "/notes",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.REPORTS_WRITE,
  ),
  createNote,
);

router.put(
  "/notes/:id",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.REPORTS_WRITE,
  ),
  updateNote,
);

router.delete(
  "/notes/:id",
  authenticateToken,
  requireOrganizationContext,
  requireOrganizationPermission(
    ORGANIZATION_PERMISSIONS.REPORTS_WRITE,
  ),
  removeNote,
);

export default router;