import { prisma } from "../config/prisma";

import type {
  AlertModel,
} from "../types/alert.types";

export class BudgetBreachDetectionService {

  async detectBudgetBreach(): Promise<AlertModel[]> {

    const now = new Date();

    const budget =
      await prisma.budget.findFirst({
        where: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!budget) {
      return [];
    }

  const spend =
  await prisma.costRecord.aggregate({
    _sum: {
      cost: true,
    },
    where: {
      usageDate: {
        gte: new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ),
      },
    },
  });

const currentSpend =
  spend._sum.cost ?? 0;

    if (
      currentSpend <= budget.amount
    ) {
      return [];
    }

    return [
      {
        id: "budget-breach",

        type: "budget_risk",

        severity: "critical",

        status: "active",

        title: "Budget Exceeded",

        description:
          `Current spend exceeds budget by $${(
            currentSpend -
            budget.amount
          ).toFixed(2)}.`,

        recommendation:
          "Investigate high-cost services and reduce discretionary cloud spend immediately.",

        metric: "Monthly Spend",

        currentValue:
          Number(
            currentSpend.toFixed(2)
          ),

        threshold:
          budget.amount,

        date:
          now
            .toISOString()
            .split("T")[0],
      },
    ];

  }

}

export const budgetBreachDetectionService =
  new BudgetBreachDetectionService();
