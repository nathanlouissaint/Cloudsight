import { z } from "zod";

import { passwordPolicy } from "../shared/password-policy.validator";

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(
      1,
      "Reset token is required",
    ),

  password: passwordPolicy,
});

export type ResetPasswordRequest =
  z.infer<typeof resetPasswordSchema>;