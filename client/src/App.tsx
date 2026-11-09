import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RouteErrorBoundary } from "./components/states/RouteErrorBoundary";

const LandingPage = lazy(
  () => import("./pages/LandingPage")
);

const StudioDemo = lazy(
  () => import("./pages/StudioDemo")
);

const HomepageRedesign = lazy(
  () => import("./pages/HomepageRedesign")
);

const SaasScorecardPage = lazy(
  () => import("./pages/SaasScorecardPage")
);

const WebsiteAuditPage = lazy(
  () => import("./pages/WebsiteAuditPage")
);

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
      <RouteErrorBoundary>
        <Suspense fallback={<div role="status">Loading page…</div>}>
          <Routes>
            <Route
              path="/website-audit"
              element={<WebsiteAuditPage />}
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

            <Route
              path="/spend-guard/setup"
              element={<ProtectedRoute><SpendGuardSetupPage /></ProtectedRoute>}
            />

            <Route
              path="/spend-guard/results"
              element={<ProtectedRoute><SpendGuardResultPage /></ProtectedRoute>}
            />

            {/* Public homepage. Dashboard routes remain behind authentication. */}
            <Route
              path="/"
              element={<HomepageRedesign />}
            />

            <Route
              path="/studio-demo"
              element={<StudioDemo />}
            />

            <Route
              path="/saas-scorecard"
              element={<SaasScorecardPage />}
            />

            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />

            <Route
              path="/costs"
              element={<ProtectedRoute><CostsPage /></ProtectedRoute>}
            />

            <Route
              path="/forecasting"
              element={<ProtectedRoute><ForecastingPage /></ProtectedRoute>}
            />

            <Route
              path="/alerts"
              element={<ProtectedRoute><AlertsPage /></ProtectedRoute>}
            />

            <Route
              path="/reports"
              element={<ProtectedRoute><ReportsPage /></ProtectedRoute>}
            />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
