
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";

import { ProtectedRoute } from "./auth/ProtectedRoute";

// New CloudSight Growth Lab homepage
const GrowthLabHomepage = lazy(
  () => import("./pages/GrowthLabHomepage")
);

// Existing Spend Guard landing page
const LandingPage = lazy(
  () => import("./pages/LandingPage")
);

// Spend Guard authentication and onboarding
const SpendGuardSignupPage = lazy(
  () => import("./pages/spend-guard/SpendGuardSignupPage")
);

const SpendGuardLoginPage = lazy(
  () => import("./pages/spend-guard/SpendGuardLoginPage")
);

const SpendGuardSetupPage = lazy(
  () => import("./pages/spend-guard/SpendGuardSetupPage")
);

const SpendGuardResultPage = lazy(
  () => import("./pages/spend-guard/SpendGuardResultPage")
);

// Existing CloudSight application
const DashboardPage = lazy(
  () => import("./pages/DashboardPage")
);

const CostsPage = lazy(
  () => import("./pages/CostsPage")
);

const ForecastingPage = lazy(
  () => import("./pages/ForecastingPage")
);

const AlertsPage = lazy(
  () => import("./pages/AlertsPage")
);

const ReportsPage = lazy(
  () => import("./pages/ReportsPage")
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Growth Lab homepage */}
          <Route
            path="/"
            element={<GrowthLabHomepage />}
          />

          {/*
            Automated website audits remain intentionally unavailable while the
            crawler is disabled. Keep the underlying implementation intact,
            but never expose an audit-job submission route publicly.
          */}
          <Route
            path="/website-audit"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="/website-audit/report/:token"
            element={<Navigate to="/" replace />}
          />

          {/* Public Spend Guard funnel */}
          <Route
            path="/spend-guard"
            element={<LandingPage />}
          />

          <Route
            path="/spend-guard/signup"
            element={<SpendGuardSignupPage />}
          />

          <Route
            path="/spend-guard/login"
            element={<SpendGuardLoginPage />}
          />

          {/* Protected Spend Guard onboarding */}
          <Route
            path="/spend-guard/setup"
            element={
              <ProtectedRoute>
                <SpendGuardSetupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/spend-guard/results"
            element={
              <ProtectedRoute>
                <SpendGuardResultPage />
              </ProtectedRoute>
            }
          />

          {/* Protected CloudSight dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/costs"
            element={
              <ProtectedRoute>
                <CostsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forecasting"
            element={
              <ProtectedRoute>
                <ForecastingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <AlertsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
