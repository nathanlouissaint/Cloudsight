import { Router } from "express";
import { getForecast } from "../controllers/forecast.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  getForecast
);

export default router;