import { Router } from "express";

import {
  getAlerts,
  getAlertHistory,
} from "../controllers/alerts.controller";

const router = Router();

router.get(
  "/",
  getAlerts
);

router.get(
  "/history",
  getAlertHistory
);

export default router;
