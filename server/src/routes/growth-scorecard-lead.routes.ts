import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createGrowthScorecardLeadRequest } from "../controllers/growth-scorecard-lead.controller";

const router = Router();
router.post("/leads", rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { message: "Too many scorecard requests. Please try again later." } }), createGrowthScorecardLeadRequest);
export default router;
