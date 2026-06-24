import { Router } from "express";
import { getTrends } from "../controllers/analytics.controller";

const router = Router();

router.get("/trends", getTrends);

export default router;
