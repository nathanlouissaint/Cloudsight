import type { Request, Response } from "express";
import { growthScorecardLeadContract } from "../contracts/growth-scorecard-lead.contract";
import { calculateScorecardScores, createGrowthScorecardLead } from "../services/growth-scorecard-lead.service";

export function makeCreateGrowthScorecardLeadRequest(createLead = createGrowthScorecardLead) {
  return async function createGrowthScorecardLeadRequest(req: Request, res: Response) {
    const parsed = growthScorecardLeadContract.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Unable to accept this request." });
    const calculated = calculateScorecardScores(parsed.data.answers);
    if (calculated.overall !== parsed.data.report.overall || Object.entries(calculated.categoryScores).some(([category, score]) => parsed.data.report.categoryScores[category as keyof typeof parsed.data.report.categoryScores] !== score)) return res.status(400).json({ message: "Unable to accept this request." });
    try {
      const lead = await createLead(parsed.data);
      return res.status(lead.duplicate ? 200 : 201).json({ success: true, leadId: lead.leadId, duplicate: lead.duplicate });
    } catch {
      return res.status(500).json({ message: "Unable to save your action plan request. Please try again." });
    }
  };
}

export const createGrowthScorecardLeadRequest = makeCreateGrowthScorecardLeadRequest();
