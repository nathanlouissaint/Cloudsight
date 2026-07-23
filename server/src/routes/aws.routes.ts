import { Router } from "express";

import {
  getAwsCosts,
} from "../controllers/aws.controller";

import {
  collectCostsController,
} from "../controllers/collection.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/cost-explorer",
  authenticateToken,
  getAwsCosts
);

router.post(
  "/collect",
  authenticateToken,
  collectCostsController
);

export default router;