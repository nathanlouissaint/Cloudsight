import { z } from "zod";

const answer = z.enum(["strong", "partial", "needs_work"]);
const category = z.enum(["messaging", "conversion", "trust", "mobile", "measurement"]);
const answers = z.object({ product_clarity: answer, audience_positioning: answer, differentiation: answer, cta_clarity: answer, signup_experience: answer, credibility: answer, buyer_objections: answer, mobile_experience: answer, conversion_tracking: answer, funnel_visibility: answer }).strict();
const categoryScores = z.object({ messaging: z.number().int().min(0).max(100), conversion: z.number().int().min(0).max(100), trust: z.number().int().min(0).max(100), mobile: z.number().int().min(0).max(100), measurement: z.number().int().min(0).max(100) }).strict();
const priority = z.object({ category, title: z.string().min(1).max(2_000), reported: z.string().min(1).max(2_000), why: z.string().min(1).max(2_000), verify: z.string().min(1).max(2_000), change: z.string().min(1).max(2_000), measure: z.string().min(1).max(2_000) }).strict();
const report = z.object({
  overall: z.number().int().min(0).max(100), categoryScores, topArea: category,
  priorities: z.array(priority).length(3), executiveSummary: z.string().min(1).max(4_000),
  quickWins: z.array(z.string().min(1).max(2_000)).max(5),
  actionPlan: z.object({ investigate: z.array(z.string().min(1).max(2_000)).max(3), validate: z.array(z.string().min(1).max(2_000)).max(5), implement: z.array(z.string().min(1).max(2_000)).max(3), measure: z.array(z.string().min(1).max(2_000)).max(3) }).strict(),
}).strict();

export const growthScorecardLeadContract = z.object({
  fullName: z.string().trim().min(2).max(200), email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().refine((value) => { const digits = value.replace(/\D/g, ""); return digits.length >= 7 && digits.length <= 15; }, "Invalid phone number."),
  answers, report, scoringVersion: z.literal("2026-11-10.1"), source: z.literal("SAAS_SCORECARD"),
}).strict();

export type GrowthScorecardLeadInput = z.infer<typeof growthScorecardLeadContract>;
