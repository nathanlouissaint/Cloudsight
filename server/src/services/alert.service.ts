import {
  anomalyDetectionService,
} from "./anomaly-detection.service";

import {
  forecastRiskDetectionService,
} from "./forecast-risk-detection.service";

import {
  budgetBreachDetectionService,
} from "./budget-breach-detection.service";

import {
  alertSummaryService,
} from "./alert-summary.service";

import type {
  AlertModel,
} from "../types/alert.types";

export class AlertService {

  async getAlerts(): Promise<AlertModel[]> {

    const alerts: AlertModel[] = [];

    alerts.push(
      ...await anomalyDetectionService.detectCostSpike()
    );

    alerts.push(
      ...await forecastRiskDetectionService.detectForecastRisk()
    );

    alerts.push(
      ...await budgetBreachDetectionService.detectBudgetBreach()
    );

    const severityOrder = {
      critical: 3,
      warning: 2,
      info: 1,
    };

    const sortedAlerts = alerts.sort(
      (a, b) =>
        severityOrder[b.severity] -
        severityOrder[a.severity]
    );

    // Build backend-owned summary.
    // This prepares Phase 9.6 without changing the API contract.
    alertSummaryService.build(
      sortedAlerts
    );

    return sortedAlerts;

  }

}

export const alertService =
  new AlertService();
