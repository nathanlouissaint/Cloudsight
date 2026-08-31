import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { httpSecurityConfig } from "./config/http-security.config";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import costsRoutes from "./routes/costs.routes";
import budgetRoutes from "./routes/budget.routes";
import forecastRoutes from "./routes/forecast.routes";
import alertsRoutes from "./routes/alerts.routes";
import reportsRoutes from "./routes/reports.routes";
import awsRoutes from "./routes/aws.routes";
import analyticsRoutes from "./routes/analytics.routes";
import accountRoutes from "./routes/account.routes";
import cloudAccountRoutes from "./routes/cloud-account.routes";
import organizationRoutes from "./routes/organization.routes";
import organizationInvitationRoutes from "./routes/organization-invitation.routes";
import serviceAnalyticsRoutes from "./routes/service-analytics.routes";
import healthRoutes from "./routes/health.routes";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";
import { createRateLimiter } from "./middleware/rate-limit.middleware";
import { RATE_LIMIT_POLICIES } from "./config/rate-limit.config";
import {
  sanitizeRequestForLogging,
  sanitizeResponseForLogging,
} from "./config/http-logging.config";

const app = express();

app.set(
  "trust proxy",
  httpSecurityConfig.trustProxy,
);

app.use(
  pinoHttp({
    serializers: {
      req: sanitizeRequestForLogging,
      res: sanitizeResponseForLogging,
    },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers[\"x-csrf-token\"]",
        "res.headers[\"set-cookie\"]",
      ],
      censor: "[REDACTED]",
    },
  })
);

app.use(helmet());

app.use(compression());

app.use(
  cors({
    origin: httpSecurityConfig.trustedFrontendOrigin,
    credentials: true,
    methods: [...httpSecurityConfig.corsMethods],
    allowedHeaders: [...httpSecurityConfig.corsAllowedHeaders],
  })
);

app.use(cookieParser());

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

app.use(
  createRateLimiter(
    RATE_LIMIT_POLICIES.global,
  )
);

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.use(
  "/organization-invitations",
  organizationInvitationRoutes,
);
app.use("/dashboard", dashboardRoutes);
app.use("/costs", costsRoutes);
app.use("/budget", budgetRoutes);
app.use("/forecast", forecastRoutes);
app.use("/alerts", alertsRoutes);
app.use("/reports", reportsRoutes);
app.use("/aws", awsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/analytics/accounts", accountRoutes);
app.use("/cloud-accounts", cloudAccountRoutes);
app.use("/analytics/services", serviceAnalyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
