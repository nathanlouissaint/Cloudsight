import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateSavings, funnelRate } from "../src/features/forma/calculations";
test("ROI uses 52 weeks and annualized monthly averages", () => {
  assert.deepEqual(calculateSavings(20, 4, 35, 25), { weekly: 20, monthly: 1040 / 12, annual: 1040, annualCost: 36400 });
});
test("funnel rates handle ordinary and empty stages", () => {
  assert.equal(funnelRate(75, 100), 75); assert.equal(funnelRate(0, 0), 0);
});

import { dashboardPeriods, comparison } from "../src/features/forma/dashboardData";
test("dashboard totals and comparisons derive from each period dataset", () => {
  assert.deepEqual(Object.values(dashboardPeriods).map((period) => period.executions.reduce((sum, n) => sum + n, 0)), [592, 2368, 7104]);
  assert.equal(comparison(592, 520), "+13.8% vs previous period");
  for (const period of Object.values(dashboardPeriods)) assert.equal(period.labels.length, period.executions.length);
});
