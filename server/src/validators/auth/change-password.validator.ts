import { z } from "zod";

import { passwordPolicy } from "../shared/password-policy.validator";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(
        1,
        "Current password is required",
      ),

    newPassword: passwordPolicy,

    confirmPassword: z
      .string()
      .min(
        1,
        "Please confirm your new password",
      ),

    revokeOtherSessions: z
      .boolean()
      .optional()
      .default(true),
  })
  .refine(
    (data) =>
      data.newPassword ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],
      message:
        "Passwords do not match",
    },
  );

export type ChangePasswordRequest =
  z.infer<
    typeof changePasswordSchema
  >;