import { Router } from "express";
import { getBudgetSummary } from "../controllers/budget.controller";

const router = Router();

router.get("/", getBudgetSummary);

export default router;