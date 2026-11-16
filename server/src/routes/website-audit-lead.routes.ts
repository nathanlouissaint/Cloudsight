import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createWebsiteAuditLeadRequest } from "../controllers/website-audit-lead.controller";

const router = Router();

router.post(
  "/leads",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many audit requests. Please try again later." },
  }),
  createWebsiteAuditLeadRequest,
);

export default router;
