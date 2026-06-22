import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import CostsPage from "./pages/CostsPage";
import ForecastingPage from "./pages/ForecastingPage";
import AlertsPage from "./pages/AlertsPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

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
    </BrowserRouter>
  );
}
