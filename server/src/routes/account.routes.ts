import { Router } from "express";

import { getAccounts } from "../controllers/account.controller";
import { getAccountTrendController } from "../controllers/account-trend.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getAccounts
);

router.get(
  "/:accountId/trends",
  authenticateToken,
  getAccountTrendController
);

export default router;