export interface AwsConnectionVerification {
  connected: boolean;
  accountId: string;
  accountName: string;
  roleArn: string;
  assumedRoleArn: string;
  connectionStatus: string;
  lastVerifiedAt: string;
  mocked: boolean;
}

export interface SpendGuardAwsConnection {
  configured: boolean;
  accountId?: string;
  accountName?: string;
  roleArn?: string | null;
  connectionStatus?: string;
  lastVerifiedAt?: string;
}

import { apiRequest } from "../api/client";

export async function verifyAwsConnection(
  roleArn: string,
): Promise<AwsConnectionVerification> {
  return apiRequest<AwsConnectionVerification>("/aws/verify-connection", {
    method: "POST",
    body: { roleArn },
  });
}

export async function getSpendGuardAwsConnection(): Promise<SpendGuardAwsConnection> {
  return apiRequest<SpendGuardAwsConnection>("/aws/connection");
}

export interface SpendGuardBudget {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  month: number;
  year: number;
}

interface SaveBudgetResponse {
  budget: SpendGuardBudget;
}

export interface SpendGuardBudgetSummary {
  organizationId: string;
  budget: number;
  month: number;
  year: number;
  configured: boolean;
}

export interface SpendGuardAnalysis {
  analysisDate: string;
  account: {
    accountId: string;
    accountName: string;
  };
  budget: {
    monthlyBudget: number;
  };
  spend: {
    currentSpend: number;
    averageDailySpend: number;
    observedDays: number;
    daysInMonth: number;
  };
  projection: {
    method: "RUN_RATE";
    projectedSpend: number;
    projectedOverage: number;
    projectedRemaining: number;
    budgetUtilizationPercent: number;
  };
  risk: {
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    reason: string;
  };
  topDrivers: Array<{
    serviceName: string;
    currentSpend: number;
    percentOfSpend: number;
  }>;
  insight: string;
}

async function requestSpendGuardAnalysis(
  method: "GET" | "POST",
): Promise<SpendGuardAnalysis> {
  return apiRequest<SpendGuardAnalysis>("/spend-guard/analysis", { method });
}

export function runSpendGuardAnalysis() {
  return requestSpendGuardAnalysis("POST");
}

export function getSpendGuardAnalysis() {
  return requestSpendGuardAnalysis("GET");
}

export async function saveSpendGuardBudget(
  amount: number,
): Promise<SpendGuardBudget> {
  const body = await apiRequest<SaveBudgetResponse>("/budget", {
    method: "POST",
    body: { amount },
  });
  return body.budget;
}

export async function getSpendGuardBudgetSummary(): Promise<SpendGuardBudgetSummary> {
  return apiRequest<SpendGuardBudgetSummary>("/budget");
}
