import type { Budget } from "@prisma/client";

import { prisma } from "../config/prisma";

export interface UpsertMonthlyBudgetInput {
  organizationId: string;
  name: string;
  amount: number;
  month: number;
  year: number;
}

export class BudgetRepository {
  async findMonthlyBudget(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<Budget | null> {
    return prisma.budget.findUnique({
      where: {
        organizationId_year_month: {
          organizationId,
          year,
          month,
        },
      },
    });
  }

  async upsertMonthlyBudget(
    input: UpsertMonthlyBudgetInput,
  ): Promise<Budget> {
    return prisma.budget.upsert({
      where: {
        organizationId_year_month: {
          organizationId: input.organizationId,
          year: input.year,
          month: input.month,
        },
      },

      create: {
        organizationId: input.organizationId,
        name: input.name,
        amount: input.amount,
        month: input.month,
        year: input.year,
      },

      update: {
        name: input.name,
        amount: input.amount,
      },
    });
  }
}

export const budgetRepository =
  new BudgetRepository();