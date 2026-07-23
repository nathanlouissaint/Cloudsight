import { Router } from "express";

import {
  getCostTrends,
  getServiceBreakdown,
} from "../controllers/costs.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/trends",
  authenticateToken,
  getCostTrends
);

router.get(
  "/services",
  authenticateToken,
  getServiceBreakdown
);

export default router;