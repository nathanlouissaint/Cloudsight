import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";
import { makeCreateGrowthScorecardLeadRequest } from "../src/controllers/growth-scorecard-lead.controller";
import { calculateScorecardScores } from "../src/services/growth-scorecard-lead.service";

test("returns a safe 500 response when scorecard persistence fails", async () => {
  const answers = { product_clarity: "strong", audience_positioning: "strong", differentiation: "strong", cta_clarity: "strong", signup_experience: "strong", credibility: "strong", buyer_objections: "strong", mobile_experience: "strong", conversion_tracking: "strong", funnel_visibility: "strong" } as const;
  const scores = calculateScorecardScores(answers);
  const request = { body: { fullName: "Ada Lovelace", email: "ada@example.test", phone: "+1 555 555 0100", answers, report: { overall: scores.overall, categoryScores: scores.categoryScores, topArea: "messaging", priorities: ["messaging", "conversion", "trust"].map((category) => ({ category, title: "Priority", reported: "Reported", why: "Reason", verify: "Verify", change: "Change", measure: "Measure" })), executiveSummary: "Summary", quickWins: ["Quick win"], actionPlan: { investigate: ["Investigate"], validate: ["Validate"], implement: ["Implement"], measure: ["Measure"] } }, scoringVersion: "2026-11-10.1", source: "SAAS_SCORECARD" } } as Request;
  let statusCode: number | undefined;
  let body: unknown;
  const response = { status(code: number) { statusCode = code; return this; }, json(value: unknown) { body = value; return this; } } as unknown as Response;
  await makeCreateGrowthScorecardLeadRequest(async () => { throw new Error("database unavailable"); })(request, response);
  assert.equal(statusCode, 500);
  assert.deepEqual(body, { message: "Unable to save your action plan request. Please try again." });
});
