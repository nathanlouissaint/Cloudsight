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

interface AwsConnectionError {
  connected?: boolean;
  message?: string;
  error?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api";

export async function verifyAwsConnection(
  roleArn: string,
): Promise<AwsConnectionVerification> {
  const token =
    sessionStorage.getItem(
      "cloudsightAccessToken",
    );

  if (!token) {
    throw new Error(
      "Your session has expired. Please create your account again.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/aws/verify-connection`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        roleArn,
      }),
    },
  );

  const body =
    (await response.json()) as
      | AwsConnectionVerification
      | AwsConnectionError;

  if (!response.ok) {
    const errorBody =
      body as AwsConnectionError;

    throw new Error(
      errorBody.error ??
        errorBody.message ??
        "Unable to verify AWS connection.",
    );
  }

  return body as AwsConnectionVerification;
}

export async function getSpendGuardAwsConnection(): Promise<SpendGuardAwsConnection> {
  const token =
    sessionStorage.getItem(
      "cloudsightAccessToken",
    );

  if (!token) {
    throw new Error(
      "Your session has expired. Please create your account again.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/aws/connection`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const body =
    (await response.json()) as
      | SpendGuardAwsConnection
      | AwsConnectionError;

  if (!response.ok) {
    const errorBody =
      body as AwsConnectionError;

    throw new Error(
      errorBody.error ??
        errorBody.message ??
        "Unable to load your AWS connection.",
    );
  }

  return body as SpendGuardAwsConnection;
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
  const token = sessionStorage.getItem(
    "cloudsightAccessToken",
  );

  if (!token) {
    throw new Error(
      "Your session has expired. Please create your account again.",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/spend-guard/analysis`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const body = (await response.json()) as
    | SpendGuardAnalysis
    | { message?: string };

  if (!response.ok) {
    throw new Error(
      "message" in body && body.message
        ? body.message
        : "Unable to run Spend Guard analysis.",
    );
  }

  return body as SpendGuardAnalysis;
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
  const token =
    sessionStorage.getItem(
      "cloudsightAccessToken",
    );

  if (!token) {
    throw new Error(
      "Your session has expired. Please create your account again.",
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/budget`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            amount,
          }),
      },
    );

  const body =
    (await response.json()) as
      | SaveBudgetResponse
      | {
          message?: string;
        };

  if (!response.ok) {
    throw new Error(
      "message" in body &&
        body.message
        ? body.message
        : "Unable to save budget.",
    );
  }

  return (
    body as SaveBudgetResponse
  ).budget;
}

export async function getSpendGuardBudgetSummary(): Promise<SpendGuardBudgetSummary> {
  const token =
    sessionStorage.getItem(
      "cloudsightAccessToken",
    );

  if (!token) {
    throw new Error(
      "Your session has expired. Please create your account again.",
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/budget`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  const body =
    (await response.json()) as
      | SpendGuardBudgetSummary
      | {
          message?: string;
        };

  if (!response.ok) {
    throw new Error(
      "message" in body &&
        body.message
        ? body.message
        : "Unable to load your budget.",
    );
  }

  return body as SpendGuardBudgetSummary;
}
