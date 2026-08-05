import { z } from "zod";

import { passwordPolicy } from "../shared/password-policy.validator";

export const registerSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .transform((value) =>
      value.toLowerCase(),
    ),

  password: passwordPolicy,
});

export type RegisterRequest =
  z.infer<typeof registerSchema>;