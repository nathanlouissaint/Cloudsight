import type {
  Response,
} from "express";

import {
  collectCosts,
} from "../aws/services/collector.service";

import {
  prisma,
} from "../config/prisma";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  calculateSpendGuardAnalysis,
} from "../services/spend-guard-analysis.service";

function getUtcPeriod(now = new Date()) {
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();

  const monthStart = new Date(
    Date.UTC(
      year,
      now.getUTCMonth(),
      1,
    ),
  );

  const todayStart = new Date(
    Date.UTC(
      year,
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );

  return {
    month,
    year,
    monthStart,
    todayStart,
  };
}

async function getOrganizationIdForUser(
  userId: string,
) {
  const membership =
    await prisma.organizationMember.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        organizationId: true,
      },
    });

  return membership?.organizationId ?? null;
}

async function loadAnalysisContext(
  userId: string,
) {
  const organizationId =
    await getOrganizationIdForUser(userId);

  if (!organizationId) {
    return {
      error: "NO_ORGANIZATION" as const,
    };
  }

  const acceptsMockConnection =
    process.env.NODE_ENV !== "production" &&
    process.env.SPEND_GUARD_MOCK_AWS ===
      "true";

  const cloudAccount =
    await prisma.cloudAccount.findFirst({
      where: {
        organizationId,
        isActive: true,
        roleArn: {
          not: null,
        },
        connectionStatus: {
          in: acceptsMockConnection
            ? [
                "VERIFIED",
                "MOCK_VERIFIED",
              ]
            : [
                "VERIFIED",
              ],
        },
      },
      orderBy: {
        lastVerifiedAt: "desc",
      },
    });

  if (!cloudAccount) {
    return {
      error: "NO_CLOUD_ACCOUNT" as const,
    };
  }

  const period = getUtcPeriod();

  const budget =
    await prisma.budget.findUnique({
      where: {
        organizationId_year_month: {
          organizationId,
          year: period.year,
          month: period.month,
        },
      },
    });

  if (
    !budget ||
    !Number.isFinite(budget.amount) ||
    budget.amount <= 0
  ) {
    return {
      error: "NO_BUDGET" as const,
    };
  }

  return {
    organizationId,
    cloudAccount,
    budget,
    period,
  };
}

async function respondWithAnalysis(
  req: AuthenticatedRequest,
  res: Response,
  collectFirst: boolean,
) {
  const userId =
    req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const context =
    await loadAnalysisContext(userId);

  if (
    "error" in context &&
    context.error
  ) {
    switch (context.error) {
      case "NO_ORGANIZATION":
        return res.status(403).json({
          message:
            "No organization is associated with this account.",
        });

      case "NO_CLOUD_ACCOUNT":
        return res.status(409).json({
          message:
            "No active verified AWS connection is configured for this organization.",
        });

      case "NO_BUDGET":
        return res.status(409).json({
          message:
            "A current monthly budget is required before analysis.",
        });
    }
  }

  if (collectFirst) {
    try {
      await collectCosts(
        context.cloudAccount,
      );
    } catch (error) {
      console.error(
        "Spend Guard collection before analysis failed:",
        error,
      );

      return res.status(502).json({
        message:
          "Unable to collect fresh AWS cost data for analysis.",
      });
    }
  }

  const costSnapshots =
    await prisma.costSnapshot.findMany({
      where: {
        accountId:
          context.cloudAccount.id,
        snapshotDate: {
          gte:
            context.period.monthStart,
          lt:
            context.period.todayStart,
        },
      },
      orderBy: {
        snapshotDate: "asc",
      },
    });

  const serviceSnapshots =
    await prisma.serviceCostSnapshot.findMany({
      where: {
        accountId:
          context.cloudAccount.id,
        snapshotDate: {
          gte:
            context.period.monthStart,
          lt:
            context.period.todayStart,
        },
      },
      orderBy: {
        snapshotDate: "asc",
      },
    });

  if (
    costSnapshots.length === 0
  ) {
    return res.status(422).json({
      message:
        "No completed daily AWS cost data is available for analysis yet.",
      code:
        "INSUFFICIENT_DATA",
    });
  }

  const analysis =
    calculateSpendGuardAnalysis({
      cloudAccount:
        context.cloudAccount,
      budget:
        context.budget,
      costSnapshots,
      serviceSnapshots,
    });

  return res.status(200).json(
    analysis,
  );
}

export async function runSpendGuardAnalysis(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    return await respondWithAnalysis(
      req,
      res,
      true,
    );
  } catch (error) {
    console.error(
      "Spend Guard analysis failed:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to run Spend Guard analysis.",
    });
  }
}

export async function getSpendGuardAnalysis(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    return await respondWithAnalysis(
      req,
      res,
      false,
    );
  } catch (error) {
    console.error(
      "Spend Guard analysis lookup failed:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to load Spend Guard analysis.",
    });
  }
}