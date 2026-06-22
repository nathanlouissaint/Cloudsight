import { Router } from "express";
import { getAlerts } from "../controllers/alerts.controller";
const router = Router();
router.get("/", getAlerts);
export default router;
//# sourceMappingURL=alerts.routes.js.map