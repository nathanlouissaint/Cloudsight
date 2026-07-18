import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  Suspense,
  lazy,
} from "react";

import { useAuth } from "./auth/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

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

  const { isAuthenticated } = useAuth();

console.log("Authenticated:", isAuthenticated);
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
  path="/register"
  element={<RegisterPage />}
/>



        <Route
         path="/login"
         element={<LoginPage />}
         />

                  

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
