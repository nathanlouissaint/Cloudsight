import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";
import { MarketingConsent } from "./components/MarketingConsent";

const DashboardPage = lazy(
  () => import("./pages/DashboardPage")
);

const WebsiteAuditPage = lazy(
  () => import("./pages/WebsiteAuditPage")
);

const SaasScorecardPage = lazy(
  () => import("./pages/SaasScorecardPage")
);

const GrowthLabWebsiteAuditPage = lazy(
  () => import("./pages/GrowthLabWebsiteAuditPage")
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

          <Route
            path="/website-audit"
            element={<WebsiteAuditPage />}
          />

          <Route
            path="/saas-scorecard"
            element={<SaasScorecardPage />}
          />

          <Route
            path="/"
            element={<GrowthLabWebsiteAuditPage />}
          />

          <Route
            path="/dashboard"
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
        <MarketingConsent />
      </Suspense>
    </BrowserRouter>
  );
}
