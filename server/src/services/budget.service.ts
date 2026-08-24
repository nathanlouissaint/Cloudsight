import type { Budget } from "@prisma/client";

import {
  budgetRepository,
} from "../repositories/budget.repository";

export interface SetMonthlyBudgetInput {
  organizationId: string;
  name: string;
  amount: number;
  month: number;
  year: number;
}

export class BudgetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BudgetValidationError";
  }
}

export class BudgetService {
  async getMonthlyBudget(
    organizationId: string,
    year: number,
    month: number,
  ): Promise<Budget | null> {
    this.validateOrganizationId(
      organizationId,
    );
    this.validatePeriod(year, month);

    return budgetRepository.findMonthlyBudget(
      organizationId,
      year,
      month,
    );
  }

  async getCurrentMonthlyBudget(
    organizationId: string,
    now = new Date(),
  ): Promise<Budget | null> {
    this.validateOrganizationId(
      organizationId,
    );

    return this.getMonthlyBudget(
      organizationId,
      now.getFullYear(),
      now.getMonth() + 1,
    );
  }

  async setMonthlyBudget(
    input: SetMonthlyBudgetInput,
  ): Promise<Budget> {
    this.validateOrganizationId(
      input.organizationId,
    );
    this.validateName(input.name);
    this.validateAmount(input.amount);
    this.validatePeriod(
      input.year,
      input.month,
    );

    return budgetRepository.upsertMonthlyBudget({
      ...input,
      name: input.name.trim(),
    });
  }

  private validateOrganizationId(
    organizationId: string,
  ): void {
    if (!organizationId.trim()) {
      throw new BudgetValidationError(
        "Organization ID is required.",
      );
    }
  }

  private validateName(
    name: string,
  ): void {
    const normalizedName =
      name.trim();

    if (!normalizedName) {
      throw new BudgetValidationError(
        "Budget name is required.",
      );
    }

    if (normalizedName.length > 100) {
      throw new BudgetValidationError(
        "Budget name must be 100 characters or fewer.",
      );
    }
  }

  private validateAmount(
    amount: number,
  ): void {
    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new BudgetValidationError(
        "Budget amount must be a positive finite number.",
      );
    }
  }

  private validatePeriod(
    year: number,
    month: number,
  ): void {
    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      throw new BudgetValidationError(
        "Budget month must be an integer from 1 through 12.",
      );
    }

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 9999
    ) {
      throw new BudgetValidationError(
        "Budget year must be an integer from 2000 through 9999.",
      );
    }
  }
}

export const budgetService =
  new BudgetService();