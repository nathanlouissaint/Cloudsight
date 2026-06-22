import { Router } from "express";

import {
  getAwsCosts,
}
from "../controllers/aws.controller";

const router = Router();

router.get(
  "/cost-explorer",
  getAwsCosts
);

export default router;
