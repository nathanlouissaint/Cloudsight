import { Router } from "express";
import rateLimit from "express-rate-limit";
import { claimBrokeredAuditJob, completeBrokeredAuditJobRequest, failBrokeredAuditJobRequest } from "../controllers/website-audit-worker-broker.controller";

const router = Router();
router.use(rateLimit({ windowMs: 60_000, limit: 240, standardHeaders: true, legacyHeaders: false, message: { message: "Too many worker requests." } }));
router.post("/claim", claimBrokeredAuditJob);
router.post("/jobs/:jobId/complete", completeBrokeredAuditJobRequest);
router.post("/jobs/:jobId/fail", failBrokeredAuditJobRequest);
export default router;
