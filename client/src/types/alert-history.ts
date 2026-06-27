export interface AlertHistoryItem {

  id: string;

  alertId: string;

  type: string;

  severity: string;

  status: string;

  title: string;

  description: string;

  recommendation: string;

  metric: string;

  currentValue: number;

  threshold: number;

  occurredAt: string;

  resolvedAt: string | null;

  createdAt: string;

}

export type AlertHistoryResponse =
  AlertHistoryItem[];
