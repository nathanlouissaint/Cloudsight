import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();
app.use("/dashboard", dashboardRoutes);
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

export default app;