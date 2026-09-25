import {
  Router,
} from "express";

import {
  getBudgetSummary,
  setBudget,
} from "../controllers/budget.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

const router =
  Router();

router.use(
  authenticateToken,
);

router.get(
  "/",
  getBudgetSummary,
);

router.post(
  "/",
  setBudget,
);

export default router;
