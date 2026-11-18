import dotenv from "dotenv";
dotenv.config();
import crypto from "node:crypto";
import { prisma } from "./config/prisma";
import { logger } from "./config/logger";
import { processNextAuditJob, recoverInterruptedAuditJobs } from "./services/website-audit-job.service";
const workerId: string = `audit-${crypto.randomUUID()}`;
let stopping = false;
async function tick() { if (!stopping) await processNextAuditJob(workerId); }
void recoverInterruptedAuditJobs().then(() => { const timer = setInterval(() => void tick(), 1_000); void tick(); const shutdown = async () => { stopping = true; clearInterval(timer); await prisma.$disconnect(); process.exit(0); }; process.on("SIGINT", () => void shutdown()); process.on("SIGTERM", () => void shutdown()); logger.info({ workerId }, "Website audit worker started"); });
