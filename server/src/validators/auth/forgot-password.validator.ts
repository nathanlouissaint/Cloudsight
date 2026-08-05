import { z } from "zod";

export const forgotPasswordSchema =
  z.object({
    email: z
      .email("Invalid email address")
      .trim()
      .transform((value) =>
        value.toLowerCase(),
      ),
  });

export type ForgotPasswordRequest =
  z.infer<
    typeof forgotPasswordSchema
  >;