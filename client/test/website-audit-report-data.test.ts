import assert from "node:assert/strict";
import test from "node:test";
import { getDisplayableAiRecommendations } from "../src/website-audit/report-data.ts";

const recommendation = { category: "messaging" as const, observedEvidence: "H1: Make audits clear", explanation: "The benefit could be more specific.", recommendedAction: "Name the outcome.", confidence: "medium" as const };

test("keeps valid AI recommendations available to the report", () => {
  assert.deepEqual(getDisplayableAiRecommendations({ opportunities: [recommendation] }), [recommendation]);
});

test("preserves the report zero-recommendation state for missing or malformed payloads", () => {
  assert.deepEqual(getDisplayableAiRecommendations(null), []);
  assert.deepEqual(getDisplayableAiRecommendations({ opportunities: [{ category: "messaging" }] }), []);
});
