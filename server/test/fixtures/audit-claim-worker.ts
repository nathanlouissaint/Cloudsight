import { claimNextAuditJob } from "../../src/services/website-audit-job.service";
import { prisma } from "../../src/config/prisma";
const workerId = process.env.AUDIT_TEST_WORKER_ID ?? "child";
void claimNextAuditJob(workerId).then((job) => { if (process.send) process.send({ id: job?.id ?? null }); }).finally(() => prisma.$disconnect());
