import { Router } from "express";
import { getBudgetSummary } from "../controllers/budget.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getBudgetSummary
);

export default router;