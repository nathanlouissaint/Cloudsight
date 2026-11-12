import type { PrismaClient } from "@prisma/client";
import { prisma } from "../config/prisma";
import type { GrowthScorecardLeadInput } from "../contracts/growth-scorecard-lead.contract";

const duplicateWindowMs = 10 * 60 * 1000;
type ScorecardLeadDatabase = Pick<PrismaClient, "saasScorecardLead">;

export function calculateScorecardScores(answers: GrowthScorecardLeadInput["answers"]) {
  const points = { strong: 100, partial: 60, needs_work: 20 } as const;
  const groups = { messaging: ["product_clarity", "audience_positioning", "differentiation"], conversion: ["cta_clarity", "signup_experience", "buyer_objections"], trust: ["credibility"], mobile: ["mobile_experience"], measurement: ["conversion_tracking", "funnel_visibility"] } as const;
  const categoryScores = Object.fromEntries(Object.entries(groups).map(([name, questionIds]) => [name, Math.round(questionIds.reduce((sum, questionId) => sum + points[answers[questionId]], 0) / questionIds.length)])) as GrowthScorecardLeadInput["report"]["categoryScores"];
  const overall = Math.round(categoryScores.messaging * .30 + categoryScores.conversion * .25 + categoryScores.trust * .15 + categoryScores.mobile * .10 + categoryScores.measurement * .20);
  return { overall, categoryScores };
}

export async function createGrowthScorecardLead(input: GrowthScorecardLeadInput, database: ScorecardLeadDatabase = prisma) {
  const recentLead = await database.saasScorecardLead.findFirst({ where: { workEmail: input.email, fullName: input.fullName, createdAt: { gte: new Date(Date.now() - duplicateWindowMs) } }, select: { id: true } });
  if (recentLead) return { leadId: recentLead.id, duplicate: true };
  const scores = calculateScorecardScores(input.answers);
  const lead = await database.saasScorecardLead.create({ data: { fullName: input.fullName, phone: input.phone, assessmentAnswers: input.answers, report: input.report, firstName: input.fullName.split(/\s+/)[0], workEmail: input.email, company: "Not provided", websiteUrl: "https://not-provided.invalid", totalScore: scores.overall, categoryScores: scores.categoryScores, answerIds: input.answers, scoringVersion: input.scoringVersion, recommendations: input.report.priorities, source: input.source } });
  return { leadId: lead.id, duplicate: false };
}
