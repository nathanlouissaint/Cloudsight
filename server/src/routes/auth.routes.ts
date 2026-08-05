import { Router } from "express";

import {
  forgotPassword,
  getAuditHistory,
  login,
  me,
  register,
  resetPasswordController,
} from "../controllers/auth.controller";

import {
  changePassword,
} from "../controllers/auth/change-password.controller";

import {
  verifyEmail,
} from "../controllers/auth/email-verification.controller";

import {
  deleteSession,
  listSessions,
  logoutAllSessions,
} from "../controllers/auth/session.controller";

import {
  logout,
} from "../controllers/auth/logout.controller";

import {
  refresh,
} from "../controllers/auth/refresh.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

import {
  validate,
} from "../middleware/validate.middleware";

import {
  changePasswordSchema,
} from "../validators/auth/change-password.validator";

import {
  forgotPasswordSchema,
} from "../validators/auth/forgot-password.validator";

import {
  loginSchema,
} from "../validators/auth/login.validator";

import {
  registerSchema,
} from "../validators/auth/register.validator";

import {
  resetPasswordSchema,
} from "../validators/auth/reset-password.validator";

import {
  verifyEmailSchema,
} from "../validators/auth/verify-email.validator";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  register,
);

router.post(
  "/login",
  validate(loginSchema),
  login,
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post(
  "/change-password",
  authenticateToken,
  validate(changePasswordSchema),
  changePassword,
);

router.post(
  "/refresh",
  refresh,
);

router.post(
  "/logout",
  logout,
);

router.get(
  "/me",
  authenticateToken,
  me,
);

router.get(
  "/audit",
  authenticateToken,
  getAuditHistory,
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