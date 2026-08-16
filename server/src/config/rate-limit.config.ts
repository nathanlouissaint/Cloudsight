export interface RateLimitPolicy {
  readonly windowMs: number;
  readonly limit: number;
}

export const RATE_LIMIT_POLICIES = {
  global: {
    windowMs: 15 * 60 * 1000,
    limit: 300,
  },
  register: {
    windowMs: 15 * 60 * 1000,
    limit: 5,
  },
  login: {
    windowMs: 10 * 60 * 1000,
    limit: 10,
  },
  forgotPassword: {
    windowMs: 15 * 60 * 1000,
    limit: 5,
  },
  resendVerification: {
    windowMs: 15 * 60 * 1000,
    limit: 3,
  },
  verifyEmail: {
    windowMs: 15 * 60 * 1000,
    limit: 10,
  },
  resetPassword: {
    windowMs: 15 * 60 * 1000,
    limit: 10,
  },
  refresh: {
    windowMs: 15 * 60 * 1000,
    limit: 120,
  },
  changePassword: {
    windowMs: 15 * 60 * 1000,
    limit: 5,
  },
  csrfBootstrap: {
    windowMs: 15 * 60 * 1000,
    limit: 60,
  },
  oauthStart: {
    windowMs: 10 * 60 * 1000,
    limit: 15,
  },
  oauthCallback: {
    windowMs: 10 * 60 * 1000,
    limit: 30,
  },
} as const satisfies Record<string, RateLimitPolicy>;

export const RATE_LIMIT_MESSAGE =
  "Too many requests. Please try again later.";

export const RATE_LIMIT_OPTIONS = {
  standardHeaders: true,
  legacyHeaders: false,
} as const;
