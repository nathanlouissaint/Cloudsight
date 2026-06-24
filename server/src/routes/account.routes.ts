import { Router } from "express";

import { getAccounts }
from "../controllers/account.controller";

import {
  getAccountTrendController
}
from "../controllers/account-trend.controller";

const router = Router();

router.get("/", getAccounts);

router.get(
  "/:accountId/trends",
  getAccountTrendController
);

export default router;
