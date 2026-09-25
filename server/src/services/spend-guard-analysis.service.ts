import type {
  Budget,
  CloudAccount,
  CostSnapshot,
  ServiceCostSnapshot,
} from "@prisma/client";

export type SpendGuardRiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

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
    level: SpendGuardRiskLevel;
    reason: string;
  };
  topDrivers: Array<{
    serviceName: string;
    currentSpend: number;
    percentOfSpend: number;
  }>;
  insight: string;
}

function money(value: number) {
  return Number(value.toFixed(2));
}

function percent(value: number) {
  return Number(value.toFixed(2));
}

function displayPercent(value: number) {
  return Number(value.toFixed(0));
}

export function getSpendGuardRisk(
  budgetUtilizationPercent: number,
) {
  let level: SpendGuardRiskLevel;

  if (budgetUtilizationPercent < 80) {
    level = "LOW";
  } else if (budgetUtilizationPercent < 100) {
    level = "MEDIUM";
  } else if (budgetUtilizationPercent < 120) {
    level = "HIGH";
  } else {
    level = "CRITICAL";
  }

  return {
    level,
    reason:
      `Projected month-end spend is ${displayPercent(
        budgetUtilizationPercent,
      )}% of your monthly budget.`,
  };
}

function buildInsight(input: {
  riskLevel: SpendGuardRiskLevel;
  projectedOverage: number;
  highestDriver?: {
    serviceName: string;
    percentOfSpend: number;
  };
}) {
  const driver = input.highestDriver
    ? `${input.highestDriver.serviceName} is the largest cost driver at ${input.highestDriver.percentOfSpend}% of observed spend.`
    : "Service-level cost data is not yet available for the observed period.";

  if (
    input.riskLevel === "HIGH" ||
    input.riskLevel === "CRITICAL"
  ) {
    return `At the current run rate, AWS spend is projected to exceed your monthly budget by $${money(input.projectedOverage).toFixed(2)}. ${driver}`;
  }

  if (input.riskLevel === "MEDIUM") {
    return `Spend is approaching the monthly budget. ${driver}`;
  }

  return `Spend is currently tracking below budget. ${driver}`;
}

export function calculateSpendGuardAnalysis(input: {
  cloudAccount: CloudAccount;
  budget: Budget;
  costSnapshots: CostSnapshot[];
  serviceSnapshots: ServiceCostSnapshot[];
  now?: Date;
}): SpendGuardAnalysis {
  const now = input.now ?? new Date();
  const observedDays = input.costSnapshots.length;

  if (observedDays === 0) {
    throw new Error(
      "At least one completed daily cost snapshot is required for analysis.",
    );
  }

  if (!Number.isFinite(input.budget.amount) || input.budget.amount <= 0) {
    throw new Error("A valid monthly budget is required for analysis.");
  }

  const currentSpend = input.costSnapshots.reduce(
    (total, snapshot) => total + snapshot.totalCost,
    0,
  );
  const averageDailySpend = currentSpend / observedDays;
  const daysInMonth = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();
  const projectedSpend = averageDailySpend * daysInMonth;
  const projectedVariance = projectedSpend - input.budget.amount;
  const projectedOverage = Math.max(projectedVariance, 0);
  const projectedRemaining = Math.max(
    input.budget.amount - projectedSpend,
    0,
  );
  const budgetUtilizationPercent =
    (projectedSpend / input.budget.amount) * 100;
  const risk = getSpendGuardRisk(budgetUtilizationPercent);

  const serviceTotals = new Map<string, number>();

  for (const snapshot of input.serviceSnapshots) {
    serviceTotals.set(
      snapshot.serviceName,
      (serviceTotals.get(snapshot.serviceName) ?? 0) +
        snapshot.cost,
    );
  }

  const totalServiceSpend = Array.from(
    serviceTotals.values(),
  ).reduce((total, value) => total + value, 0);
  const topDrivers = Array.from(serviceTotals.entries())
    .map(([serviceName, total]) => ({
      serviceName,
      currentSpend: money(total),
      percentOfSpend:
        totalServiceSpend > 0
          ? percent((total / totalServiceSpend) * 100)
          : 0,
    }))
    .sort((a, b) => b.currentSpend - a.currentSpend)
    .slice(0, 3);

  return {
    analysisDate: now.toISOString(),
    account: {
      accountId: input.cloudAccount.awsAccountId,
      accountName: input.cloudAccount.accountName,
    },
    budget: {
      monthlyBudget: money(input.budget.amount),
    },
    spend: {
      currentSpend: money(currentSpend),
      averageDailySpend: money(averageDailySpend),
      observedDays,
      daysInMonth,
    },
    projection: {
      method: "RUN_RATE",
      projectedSpend: money(projectedSpend),
      projectedOverage: money(projectedOverage),
      projectedRemaining: money(projectedRemaining),
      budgetUtilizationPercent: percent(budgetUtilizationPercent),
    },
    risk,
    topDrivers,
    insight: buildInsight({
      riskLevel: risk.level,
      projectedOverage,
      highestDriver: topDrivers[0],
    }),
  };
}
