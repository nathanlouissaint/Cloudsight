import type { Request, Response } from "express";
import { auditWorkerClaimRequest, auditWorkerFailureRequest, auditWorkerResultRequest } from "../contracts/website-audit-worker-broker.contract";
import { auditWorkerBrokerAuthorized } from "../services/website-audit-worker-broker-auth.service";
import { claimNextAuditJob, recoverInterruptedAuditJobs } from "../services/website-audit-job.service";
import { completeBrokeredAuditJob, failBrokeredAuditJob } from "../services/website-audit-worker-broker.service";

function authorized(req: Request, res: Response) {
  if (auditWorkerBrokerAuthorized(req.header("authorization"))) return true;
  res.status(401).json({ message: "Unauthorized worker." });
  return false;
}
export async function claimBrokeredAuditJob(req: Request, res: Response) {
  if (!authorized(req, res)) return;
  const body = auditWorkerClaimRequest.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid worker request." });
  await recoverInterruptedAuditJobs();
  const job = await claimNextAuditJob(body.data.workerId);
  return res.json(job ? { job: { id: job.id, normalizedUrl: job.normalizedUrl } } : { job: null });
}
export async function completeBrokeredAuditJobRequest(req: Request, res: Response) {
  if (!authorized(req, res)) return;
  const body = auditWorkerResultRequest.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid audit result." });
  const jobId = typeof req.params.jobId === "string" ? req.params.jobId : "";
  const accepted = await completeBrokeredAuditJob(jobId, req.header("x-audit-worker-id") ?? "", body.data.auditedUrl, body.data.metadata);
  return accepted ? res.status(204).end() : res.status(409).json({ message: "Audit claim is no longer active." });
}
export async function failBrokeredAuditJobRequest(req: Request, res: Response) {
  if (!authorized(req, res)) return;
  const body = auditWorkerFailureRequest.safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: "Invalid audit failure." });
  const jobId = typeof req.params.jobId === "string" ? req.params.jobId : "";
  const accepted = await failBrokeredAuditJob(jobId, req.header("x-audit-worker-id") ?? "", body.data.code);
  return accepted ? res.status(204).end() : res.status(409).json({ message: "Audit claim is no longer active." });
}
