import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../config/prisma";
import { saasScorecardLeadContract } from "../contracts/saas-scorecard-lead.contract";
const router = Router();
router.post("/leads", rateLimit({ windowMs:15*60*1000, limit:8, standardHeaders:true, legacyHeaders:false }), async (req,res) => { const parsed=saasScorecardLeadContract.safeParse(req.body); if(!parsed.success || parsed.data.honeypot.trim()) return res.status(400).json({message:"Unable to accept this request."}); const {honeypot:_honeypot,...lead}=parsed.data; try { const recent=await prisma.saasScorecardLead.findFirst({where:{workEmail:lead.workEmail,websiteUrl:lead.websiteUrl,createdAt:{gte:new Date(Date.now()-600000)}},select:{id:true}}); if(recent) return res.status(200).json({success:true,leadId:recent.id,duplicate:true}); const saved=await prisma.saasScorecardLead.create({data:lead}); return res.status(201).json({success:true,leadId:saved.id,duplicate:false}); } catch { return res.status(500).json({message:"Unable to save your action plan request. Please try again."}); } });
export default router;
