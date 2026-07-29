import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";

import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const DashboardPage = lazy(
  () => import("./pages/DashboardPage")
);

const SecurityPage = lazy(
  () => import("./pages/settings/SecurityPage")
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
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/"
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

          <Route
            path="/settings/security"
            element={
              <ProtectedRoute>
                <SecurityPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}