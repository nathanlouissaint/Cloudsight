import {
  anomalyDetectionService,
} from "./anomaly-detection.service";

import {
  forecastRiskDetectionService,
} from "./forecast-risk-detection.service";

import {
  budgetBreachDetectionService,
} from "./budget-breach-detection.service";

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

    return alerts.sort(
      (a, b) =>
        severityOrder[b.severity] -
        severityOrder[a.severity]
    );

  }

}

export const alertService =
  new AlertService();
