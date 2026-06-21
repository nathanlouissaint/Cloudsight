import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import costsRoutes from "./routes/costs.routes";
import budgetRoutes from "./routes/budget.routes";
import forecastRoutes from "./routes/forecast.routes";
import alertsRoutes from "./routes/alerts.routes";
import reportsRoutes from "./routes/reports.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "CloudSight API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/costs", costsRoutes);
app.use("/budget", budgetRoutes);
app.use("/forecast", forecastRoutes);
app.use("/alerts", alertsRoutes);
app.use("/reports", reportsRoutes);

export default app;
