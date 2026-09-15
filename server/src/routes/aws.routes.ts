import { Router } from "express";

import {
  getAwsCosts,
  verifyAwsConnection,
} from "../controllers/aws.controller";

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
  collectCostsController,
);

router.post(
  "/verify-connection",
  verifyAwsConnection,
);

export default router;
