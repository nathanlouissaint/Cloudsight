import { Router } from "express";
import rateLimit from "express-rate-limit";
import { readAuditJob, submitAuditJob } from "../controllers/website-audit-job.controller";
const router = Router();
router.post("/jobs", rateLimit({ windowMs: 60 * 60_000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { message: "Too many audit requests." } }), submitAuditJob);
router.get("/jobs/:token", readAuditJob);
export default router;
