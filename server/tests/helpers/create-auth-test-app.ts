import express from "express";
import cookieParser from "cookie-parser";

import { googleOAuthCallback } from "../../src/controllers/auth/federated-auth.controller";
import { refresh } from "../../src/controllers/auth/refresh.controller";
import { requireTrustedOrigin, validateRefreshBoundCsrf } from "../../src/middleware/csrf.middleware";

/**
 * Minimal HTTP composition: production controllers and Express cookie/query
 * handling, with external persistence/provider boundaries mocked by tests.
 */
export function createAuthTestApp(options: { refreshSecurity?: boolean } = {}) {
  const app = express();
  app.use(cookieParser());
  app.get("/auth/oauth/google/callback", googleOAuthCallback);
  if (options.refreshSecurity) {
    app.post("/auth/refresh", requireTrustedOrigin, validateRefreshBoundCsrf, refresh);
  } else {
    app.post("/auth/refresh", refresh);
  }
  return app;
}
