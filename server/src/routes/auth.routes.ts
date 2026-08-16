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
  resendVerification,
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
  bootstrapCsrf,
} from "../controllers/auth/csrf.controller";
import {
  startGoogleOAuth,
  googleOAuthCallback,
  genericOAuthStart,
  genericOAuthCallback,
} from "../controllers/auth/federated-auth.controller";

import {
  authenticateToken,
} from "../middleware/auth.middleware";

import {
  requireTrustedOrigin,
  validatePreAuthCsrf,
  validateRefreshBoundCsrf,
} from "../middleware/csrf.middleware";

import {
  validate,
} from "../middleware/validate.middleware";

import {
  authenticatedUserAndIpRateLimitKey,
  createRateLimiter,
  ipRateLimitKey,
  requestEmailAndIpRateLimitKey,
} from "../middleware/rate-limit.middleware";

import {
  RATE_LIMIT_POLICIES,
} from "../config/rate-limit.config";

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

const registerRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.register,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const loginIpRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.login,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const loginEmailRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.login,
    {
      keyGenerator:
        requestEmailAndIpRateLimitKey,
    },
  );

const forgotPasswordIpRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.forgotPassword,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const forgotPasswordEmailRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.forgotPassword,
    {
      keyGenerator:
        requestEmailAndIpRateLimitKey,
    },
  );

const resendVerificationRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.resendVerification,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const verifyEmailRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.verifyEmail,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const resetPasswordRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.resetPassword,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const refreshRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.refresh,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const changePasswordRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.changePassword,
    {
      keyGenerator:
        authenticatedUserAndIpRateLimitKey,
    },
  );

const oauthStartRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.oauthStart,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

const oauthCallbackRateLimiter =
  createRateLimiter(
    RATE_LIMIT_POLICIES.oauthCallback,
    {
      keyGenerator: ipRateLimitKey,
    },
  );

router.get(
  "/csrf",
  requireTrustedOrigin,
  bootstrapCsrf,
);

router.get(
  "/oauth/google/start",
  oauthStartRateLimiter,
  startGoogleOAuth,
);

router.get(
  "/oauth/google/callback",
  oauthCallbackRateLimiter,
  googleOAuthCallback,
);

router.get(
  "/oauth/:provider/start",
  oauthStartRateLimiter,
  genericOAuthStart,
);

router.get(
  "/oauth/:provider/callback",
  oauthCallbackRateLimiter,
  genericOAuthCallback,
);

router.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  register,
);

router.post(
  "/login",
  loginIpRateLimiter,
  loginEmailRateLimiter,
  requireTrustedOrigin,
  validatePreAuthCsrf,
  validate(loginSchema),
  login,
);

router.post(
  "/forgot-password",
  forgotPasswordIpRateLimiter,
  forgotPasswordEmailRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  resetPasswordRateLimiter,
  validate(resetPasswordSchema),
  resetPasswordController,
);

router.post(
  "/verify-email",
  verifyEmailRateLimiter,
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post(
  "/resend-verification",
  resendVerificationRateLimiter,
  authenticateToken,
  resendVerification,
);

router.post(
  "/change-password",
  authenticateToken,
  changePasswordRateLimiter,
  validate(changePasswordSchema),
  changePassword,
);

router.post(
  "/refresh",
  refreshRateLimiter,
  requireTrustedOrigin,
  validateRefreshBoundCsrf,
  refresh,
);

router.post(
  "/logout",
  requireTrustedOrigin,
  validateRefreshBoundCsrf,
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
  requireTrustedOrigin,
  validateRefreshBoundCsrf,
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
  requireTrustedOrigin,
  validateRefreshBoundCsrf,
  authenticateToken,
  deleteSession,
);

export default router;
