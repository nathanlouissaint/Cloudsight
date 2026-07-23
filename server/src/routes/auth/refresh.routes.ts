import { Router } from "express";

import { refresh } from "../../controllers/auth/refresh.controller";

const router = Router();

router.post("/", refresh);

export default router;