import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { httpLogger } from "./config/logger";

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
import serviceAnalyticsRoutes from "./routes/service-analytics.routes";
import healthRoutes from "./routes/health.routes";
import spendGuardAnalysisRoutes from "./routes/spend-guard-analysis.routes";
import websiteAuditLeadRoutes from "./routes/website-audit-lead.routes";

import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware";

const app = express();

app.set("trust proxy", false);

app.use(httpLogger);

app.use(helmet());

app.use(compression());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
    credentials: true,
  })
);

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
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/health", healthRoutes);

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/costs", costsRoutes);
app.use("/budget", budgetRoutes);
app.use("/forecast", forecastRoutes);
app.use("/alerts", alertsRoutes);
app.use("/reports", reportsRoutes);
app.use("/aws", awsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/analytics/accounts", accountRoutes);
app.use("/analytics/services", serviceAnalyticsRoutes);
app.use("/spend-guard", spendGuardAnalysisRoutes);
app.use("/website-audit", websiteAuditLeadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
