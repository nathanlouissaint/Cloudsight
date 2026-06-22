import { Request, Response } from "express";
import { getCostSummary, } from "../aws/services/cost-explorer.service";
export async function getAwsCosts(req, res) {
    const data = await getCostSummary();
    res.json(data);
}
//# sourceMappingURL=aws.controller.js.map