import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .trim()
    .min(
      1,
      "Verification token is required",
    ),
});

export type VerifyEmailRequest =
  z.infer<
    typeof verifyEmailSchema
  >;