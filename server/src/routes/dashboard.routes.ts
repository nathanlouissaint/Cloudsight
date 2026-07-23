import { Router } from "express";

import { getDashboardSummary } from "../controllers/dashboard.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getDashboardSummary);

export default router;