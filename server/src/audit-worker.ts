import dotenv from "dotenv";
dotenv.config();
import crypto from "node:crypto";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { processNextAuditJob, recoverInterruptedAuditJobs } from "./services/website-audit-job.service";
import { processNextBrokeredAuditJob } from "./services/website-audit-brokered-worker.service";
const workerId: string = `audit-${crypto.randomUUID()}`;
let stopping = false;
async function start() {
  const brokered = Boolean(process.env.AUDIT_WORKER_BROKER_URL);
  const tick = brokered
    ? async () => { if (!stopping) await processNextBrokeredAuditJob(workerId); }
    : async () => { if (!stopping) await processNextAuditJob(workerId); };
  if (!brokered) await recoverInterruptedAuditJobs();
  const timer = setInterval(() => void tick(), 1_000);
  void tick();
  const shutdown = async () => { stopping = true; clearInterval(timer); if (!brokered) await prisma.$disconnect(); process.exit(0); };
  process.on("SIGINT", () => void shutdown()); process.on("SIGTERM", () => void shutdown());
  logger.info({ workerId, brokered }, "Website audit worker started");
}
void start();
