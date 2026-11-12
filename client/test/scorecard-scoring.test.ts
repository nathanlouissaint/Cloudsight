import assert from "node:assert/strict";
import { test } from "node:test";
import { scorecardQuestions } from "../src/scorecard/questions";
import { calculateScorecard, getRecommendations, isScorecardComplete } from "../src/scorecard/scoring";

const answers = (answer: "strong" | "partial" | "weak") => Object.fromEntries(scorecardQuestions.map((question) => [question.id, answer]));

test("defines ten questions across five categories totaling 100 points", () => {
  assert.equal(scorecardQuestions.length, 10);
  const categories = [...new Set(scorecardQuestions.map((question) => question.categoryId))];
  assert.equal(categories.length, 5);
  assert.equal(categories.reduce((total, id) => total + scorecardQuestions.find((question) => question.categoryId === id)!.categoryMaximum, 0), 100);
});

test("returns deterministic maximum, minimum, and middle scores", () => {
  assert.equal(calculateScorecard(answers("strong")).totalScore, 100);
  assert.equal(calculateScorecard(answers("weak")).totalScore, 0);
  assert.equal(calculateScorecard(answers("partial")).totalScore, 50);
});

test("handles mixed, missing, invalid, and changed answers", () => {
  const mixed = { q1: "strong" as const, q2: "partial" as const, q3: "weak" as const, q4: "invalid" as never };
  assert.equal(calculateScorecard(mixed).totalScore, 18.75);
  assert.equal(isScorecardComplete(mixed), false);
  const changed = { ...answers("weak"), q1: "strong" as const };
  assert.equal(calculateScorecard(changed).questionScores.q1, 12.5);
  assert.equal(isScorecardComplete(answers("strong")), true);
});

test("ranks deterministic recommendations without flagging strong answers", () => {
  assert.deepEqual(getRecommendations(answers("strong")), []);
  const recommendations = getRecommendations({ ...answers("strong"), q3:"weak", q1:"partial" });
  assert.deepEqual(recommendations.map((item) => item.questionId), ["q3", "q1"]);
});
