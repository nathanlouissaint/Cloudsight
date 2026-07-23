import { Router } from "express";

import {
  getServices,
  getTopServiceDrivers,
  getServiceTrends,
} from "../controllers/service-analytics.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getServices
);

router.get(
  "/top-drivers",
  authenticateToken,
  getTopServiceDrivers
);

router.get(
  "/:serviceName/trends",
  authenticateToken,
  getServiceTrends
);

export default router;