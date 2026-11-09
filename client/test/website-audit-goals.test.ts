import assert from "node:assert/strict";
import { test } from "node:test";
import { getWebsiteAuditGoal, getWebsiteAuditGoalLabelFromSearch, websiteAuditGoals } from "../src/website-audit/goals";

test("accepts each homepage goal value", () => {
  assert.equal(websiteAuditGoals.length, 8);
  for (const goal of websiteAuditGoals) assert.equal(getWebsiteAuditGoal(goal.value), goal);
});

test("safely rejects an invalid or absent homepage goal", () => {
  assert.equal(getWebsiteAuditGoal("invalid-goal"), undefined);
  assert.equal(getWebsiteAuditGoal(null), undefined);
});

test("maps a valid goal query parameter to the persisted website problem field", () => {
  assert.equal(getWebsiteAuditGoalLabelFromSearch("?goal=build-a-lead-generation-funnel"), "Build a lead generation funnel");
  assert.equal(getWebsiteAuditGoalLabelFromSearch("?goal=invalid"), "");
});
