import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  budgetRepository,
} from "../../src/repositories/budget.repository";

import {
  BudgetService,
  BudgetValidationError,
} from "../../src/services/budget.service";

const findMonthlyBudget = vi.spyOn(
  budgetRepository,
  "findMonthlyBudget",
);

const upsertMonthlyBudget = vi.spyOn(
  budgetRepository,
  "upsertMonthlyBudget",
);

const existingBudget = {
  id: "budget-1",
  organizationId: "org-1",
  name: "Monthly AWS Budget",
  amount: 5000,
  month: 8,
  year: 2026,
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-01T00:00:00.000Z"),
};

describe("BudgetService", () => {
  let service: BudgetService;

  beforeEach(() => {
    vi.clearAllMocks();

    service = new BudgetService();

    findMonthlyBudget.mockResolvedValue(
      existingBudget,
    );

    upsertMonthlyBudget.mockResolvedValue(
      existingBudget,
    );
  });

  it("reads a budget using the organization and requested period", async () => {
    const result =
      await service.getMonthlyBudget(
        "user-1",
        2026,
        8,
      );

    expect(findMonthlyBudget).toHaveBeenCalledWith(
      "user-1",
      2026,
      8,
    );

    expect(result).toEqual(existingBudget);
  });

  it("resolves the current monthly budget from the supplied date", async () => {
    const now =
      new Date("2026-08-13T12:00:00.000Z");

    await service.getCurrentMonthlyBudget(
      "user-1",
      now,
    );

    expect(findMonthlyBudget).toHaveBeenCalledWith(
      "user-1",
      2026,
      8,
    );
  });

  it("normalizes the budget name before persistence", async () => {
    await service.setMonthlyBudget({
      organizationId: "org-1",
      name: "  Monthly AWS Budget  ",
      amount: 5000,
      month: 8,
      year: 2026,
    });

    expect(upsertMonthlyBudget).toHaveBeenCalledWith({
      organizationId: "org-1",
      name: "Monthly AWS Budget",
      amount: 5000,
      month: 8,
      year: 2026,
    });
  });

  it.each([
    "",
    " ",
    "\t",
  ])(
    "rejects an invalid organization ID",
    async (userId) => {
      await expect(
        service.getMonthlyBudget(
          userId,
          2026,
          8,
        ),
      ).rejects.toBeInstanceOf(
        BudgetValidationError,
      );

      expect(
        findMonthlyBudget,
      ).not.toHaveBeenCalled();
    },
  );

  it.each([
    "",
    " ",
    "\t",
  ])(
    "rejects a blank budget name",
    async (name) => {
      await expect(
        service.setMonthlyBudget({
          organizationId: "org-1",
          name,
          amount: 5000,
          month: 8,
          year: 2026,
        }),
      ).rejects.toBeInstanceOf(
        BudgetValidationError,
      );

      expect(
        upsertMonthlyBudget,
      ).not.toHaveBeenCalled();
    },
  );

  it("rejects a budget name longer than 100 characters", async () => {
    await expect(
      service.setMonthlyBudget({
        organizationId: "org-1",
        name: "a".repeat(101),
        amount: 5000,
        month: 8,
        year: 2026,
      }),
    ).rejects.toBeInstanceOf(
      BudgetValidationError,
    );

    expect(
      upsertMonthlyBudget,
    ).not.toHaveBeenCalled();
  });

  it.each([
    0,
    -1,
    -5000,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])(
    "rejects invalid budget amount %s",
    async (amount) => {
      await expect(
        service.setMonthlyBudget({
          organizationId: "org-1",
          name: "Monthly AWS Budget",
          amount,
          month: 8,
          year: 2026,
        }),
      ).rejects.toBeInstanceOf(
        BudgetValidationError,
      );

      expect(
        upsertMonthlyBudget,
      ).not.toHaveBeenCalled();
    },
  );

  it.each([
    0,
    13,
    -1,
    1.5,
  ])(
    "rejects invalid month %s",
    async (month) => {
      await expect(
        service.setMonthlyBudget({
          organizationId: "org-1",
          name: "Monthly AWS Budget",
          amount: 5000,
          month,
          year: 2026,
        }),
      ).rejects.toBeInstanceOf(
        BudgetValidationError,
      );

      expect(
        upsertMonthlyBudget,
      ).not.toHaveBeenCalled();
    },
  );

  it.each([
    1999,
    10000,
    2026.5,
  ])(
    "rejects invalid year %s",
    async (year) => {
      await expect(
        service.setMonthlyBudget({
          organizationId: "org-1",
          name: "Monthly AWS Budget",
          amount: 5000,
          month: 8,
          year,
        }),
      ).rejects.toBeInstanceOf(
        BudgetValidationError,
      );

      expect(
        upsertMonthlyBudget,
      ).not.toHaveBeenCalled();
    },
  );

  it("does not call persistence when read validation fails", async () => {
    await expect(
      service.getMonthlyBudget(
        "user-1",
        2026,
        13,
      ),
    ).rejects.toBeInstanceOf(
      BudgetValidationError,
    );

    expect(
      findMonthlyBudget,
    ).not.toHaveBeenCalled();
  });
});
