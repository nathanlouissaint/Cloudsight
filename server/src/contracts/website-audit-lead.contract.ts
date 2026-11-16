import { z } from "zod";

export const websiteAuditBudgetRanges = [
  "$5K–$10K",
  "$10K–$20K",
  "$20K+",
  "Not sure yet",
] as const;

export const websiteAuditLaunchTimelines = [
  "Within 30 days",
  "1–3 months",
  "3–6 months",
  "Exploring options",
] as const;

const textField = (label: string, max: number) =>
  z.string()
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const websiteUrl = z.string()
  .trim()
  .min(1, "Website URL is required.")
  .max(2048, "Website URL must be 2048 characters or fewer.")
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Website URL must be a valid HTTP(S) URL.")
  .transform((value) => new URL(value).href);

export const websiteAuditLeadContract = z.object({
  firstName: textField("First name", 100),
  lastName: z.string().trim().max(100).optional().default(""),
  workEmail: z.string().trim().toLowerCase().email("Enter a valid work email.").max(320),
  company: textField("Company", 200),
  websiteUrl,
  companyDescription: z.string().trim().max(2000).optional().default(""),
  websiteProblem: z.string().trim().max(2000).optional().default(""),
  launchTimeline: z.enum(websiteAuditLaunchTimelines).optional().default("Exploring options"),
  budgetRange: z.enum(websiteAuditBudgetRanges).optional().default("Not sure yet"),
  honeypot: z.string().max(200).optional().default(""),
}).strict();

export type WebsiteAuditLeadInput = z.infer<typeof websiteAuditLeadContract>;
