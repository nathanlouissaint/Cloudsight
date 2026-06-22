import { Router } from "express";
import { getCostTrends, getServiceBreakdown, } from "../controllers/costs.controller";
const router = Router();
router.get("/trends", getCostTrends);
router.get("/services", getServiceBreakdown);
export default router;
//# sourceMappingURL=costs.routes.js.map