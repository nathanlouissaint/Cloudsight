import {
  Router,
} from "express";

import {
  getSpendGuardAnalysis,
  runSpendGuardAnalysis,
} from "../controllers/spend-guard-analysis.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);
router.get("/analysis", getSpendGuardAnalysis);
router.post("/analysis", runSpendGuardAnalysis);

export default router;
