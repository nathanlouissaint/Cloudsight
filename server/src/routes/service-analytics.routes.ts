import { Router } from "express";

import {
  getServices,
  getTopServiceDrivers,
  getServiceTrends,
} from "../controllers/service-analytics.controller";

const router = Router();

router.get("/", getServices);

router.get(
  "/top-drivers",
  getTopServiceDrivers
);

router.get(
  "/:serviceName/trends",
  getServiceTrends
);

export default router;
