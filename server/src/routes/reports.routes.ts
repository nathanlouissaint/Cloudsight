import { Router } from "express";
import { getExecutiveReport } from "../controllers/reports.controller";

const router = Router();

router.get("/", getExecutiveReport);

export default router;
