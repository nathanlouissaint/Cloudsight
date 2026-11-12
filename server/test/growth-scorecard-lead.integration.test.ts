import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../src/app";
import { prisma } from "../src/config/prisma";
import { calculateScorecardScores } from "../src/services/growth-scorecard-lead.service";

const runId = randomUUID();
const emailPrefix = `growth-scorecard-${runId}`;
let server: Server;
let baseUrl: string;

function payload(suffix = "valid") {
  const answers = { product_clarity: "strong", audience_positioning: "partial", differentiation: "needs_work", cta_clarity: "strong", signup_experience: "partial", credibility: "strong", buyer_objections: "needs_work", mobile_experience: "partial", conversion_tracking: "strong", funnel_visibility: "needs_work" } as const;
  const scores = calculateScorecardScores(answers);
  return {
    fullName: "Ada Lovelace", email: `${emailPrefix}-${suffix}@example.test`, phone: "+1 555 555 0100", answers,
    report: { overall: scores.overall, categoryScores: scores.categoryScores, topArea: "measurement", priorities: ["messaging", "conversion", "measurement"].map((category) => ({ category, title: "Priority", reported: "Reported detail", why: "Reason", verify: "Verify", change: "Change", measure: "Measure" })), executiveSummary: "Summary", quickWins: ["Quick win 1", "Quick win 2", "Quick win 3", "Quick win 4", "Quick win 5"], actionPlan: { investigate: ["Investigate"], validate: ["Validate 1", "Validate 2", "Validate 3", "Validate 4", "Validate 5"], implement: ["Implement"], measure: ["Measure"] } },
    scoringVersion: "2026-11-10.1", source: "SAAS_SCORECARD",
  };
}

async function submit(body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}/scorecard/leads`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { response, body: await response.json() as Record<string, unknown> };
}

before(async () => {
  if (!process.env.DATABASE_URL?.includes("cloudsight_test")) throw new Error("Growth Scorecard integration tests require cloudsight_test.");
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await prisma.saasScorecardLead.deleteMany({ where: { workEmail: { startsWith: emailPrefix } } });
});

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await prisma.$disconnect();
});

test("persists a valid growth-lab scorecard lead", async () => {
  const input = payload();
  const result = await submit(input);
  assert.equal(result.response.status, 201);
  assert.equal(result.body.success, true);
  const lead = await prisma.saasScorecardLead.findUnique({ where: { id: result.body.leadId as string } });
  assert.equal(lead?.fullName, input.fullName);
  assert.equal(lead?.workEmail, input.email);
  assert.equal(lead?.phone, input.phone);
  assert.deepEqual(lead?.assessmentAnswers, input.answers);
  assert.deepEqual(lead?.report, input.report);
});

test("rejects invalid or inconsistent scorecard submissions", async () => {
  const invalid = await submit({ ...payload("invalid"), phone: "123" });
  assert.equal(invalid.response.status, 400);
  const inconsistent = payload("inconsistent");
  inconsistent.report.overall = 0;
  const badScore = await submit(inconsistent);
  assert.equal(badScore.response.status, 400);
});
