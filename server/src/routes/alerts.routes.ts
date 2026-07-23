import { Router } from "express";

import {
  getAlerts,
  getAlertHistory,
} from "../controllers/alerts.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getAlerts
);

router.get(
  "/history",
  authenticateToken,
  getAlertHistory
);

export default router;