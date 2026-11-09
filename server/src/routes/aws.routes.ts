import { Router } from "express";

import {
  getAwsConnection,
  getAwsCosts,
  verifyAwsConnection,
} from "../controllers/aws.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

import {
  collectCostsController,
} from "../controllers/collection.controller";

const router = Router();

router.get(
  "/cost-explorer",
  getAwsCosts,
);

router.post(
  "/collect",
  authenticateToken,
  collectCostsController,
);

router.post(
  "/verify-connection",
  authenticateToken,
  verifyAwsConnection,
);

router.get(
  "/connection",
  authenticateToken,
  getAwsConnection,
);

export default router;
