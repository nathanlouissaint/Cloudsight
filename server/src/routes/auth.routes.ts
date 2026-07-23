import { Router } from "express";

import {
  login,
  me,
  register,
} from "../controllers/auth.controller";

import {
  deleteSession,
  listSessions,
  logoutAllSessions,
} from "../controllers/auth/session.controller";

import { refresh } from "../controllers/auth/refresh.controller";
import { logout } from "../controllers/auth/logout.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.get(
  "/me",
  authenticateToken,
  me,
);

router.post(
  "/logout-all",
  authenticateToken,
  logoutAllSessions,
);

router.get(
  "/sessions",
  authenticateToken,
  listSessions,
);

router.delete(
  "/sessions/:sessionId",
  authenticateToken,
  deleteSession,
);

export default router;