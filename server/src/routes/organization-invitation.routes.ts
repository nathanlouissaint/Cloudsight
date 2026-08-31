import {
  Router,
} from "express";

import {
  acceptOrganizationInvitation,
  getOrganizationInvitation,
} from "../controllers/organization/organization-invitation.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/:token",
  authenticateToken,
  getOrganizationInvitation,
);

router.post(
  "/:token/accept",
  authenticateToken,
  acceptOrganizationInvitation,
);

export default router;
