import { z } from "zod";

const boundedText = (max: number) => z.string().trim().max(max);
const nullableText = (max: number) => boundedText(max).nullable();

export const auditWorkerClaimRequest = z.object({ workerId: boundedText(128).regex(/^audit-[A-Za-z0-9_-]+$/) }).strict();

export const auditWorkerResultRequest = z.object({
  auditedUrl: z.string().url().max(2048),
  metadata: z.object({
    title: nullableText(512),
    metaDescription: nullableText(2048),
    canonicalUrl: nullableText(2048),
    robots: nullableText(512),
    language: nullableText(64),
    h1: z.array(boundedText(512)).max(30),
    h2: z.array(boundedText(512)).max(30),
    ctas: z.array(z.object({ text: boundedText(512), href: boundedText(2048) }).strict()).max(12),
    internalNavigation: z.array(z.object({ text: boundedText(512), href: boundedText(2048) }).strict()).max(30),
    forms: z.array(z.object({ action: nullableText(2048), method: boundedText(32), fields: z.array(boundedText(128)).max(20) }).strict()).max(10),
    mainText: boundedText(6000).optional(),
  }).strict(),
}).strict();

export const auditWorkerFailureRequest = z.object({ code: boundedText(80).regex(/^[A-Z0-9_]+$/) }).strict();

export type AuditWorkerResult = z.infer<typeof auditWorkerResultRequest>;
