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

import {
  alertMetricsService,
} from "./alert-metrics.service";

import type {
  AlertModel,
} from "../types/alert.types";

import type {
  AlertSummary,
} from "./alert-summary.service";

import type {
  AlertMetrics,
} from "./alert-metrics.service";

export interface AlertsResponseModel {
  summary: AlertSummary;
  metrics: AlertMetrics;
  alerts: AlertModel[];
}

export class AlertService {

  async getAlerts(): Promise<AlertsResponseModel> {

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

    return {

      summary:
        alertSummaryService.build(
          sortedAlerts
        ),

      metrics:
        alertMetricsService.build(
          sortedAlerts
        ),

      alerts:
        sortedAlerts,

    };

  }

}

export const alertService =
  new AlertService();
