import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";

const LandingPage = lazy(
  () => import("./pages/LandingPage")
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
      <Suspense
        fallback={
          <div>
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Public Spend Guard landing page */}
          <Route
            path="/spend-guard"
            element={<LandingPage />}
          />

          {/* Existing CloudSight application */}
          <Route
            path="/"
            element={<DashboardPage />}
          />

          <Route
            path="/costs"
            element={<CostsPage />}
          />

          <Route
            path="/forecasting"
            element={<ForecastingPage />}
          />

          <Route
            path="/alerts"
            element={<AlertsPage />}
          />

          <Route
            path="/reports"
            element={<ReportsPage />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}