import { Router } from "express";

import {
  getAwsCosts,
} from "../controllers/aws.controller";

import {
  collectCostsController,
} from "../controllers/collection.controller";

const router = Router();

router.get(
  "/cost-explorer",
  getAwsCosts
);

router.post(
  "/collect",
  collectCostsController
);

export default router;
