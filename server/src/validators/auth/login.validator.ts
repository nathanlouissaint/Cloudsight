import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .trim()
    .transform((value) =>
      value.toLowerCase(),
    ),

  password: z
    .string()
    .min(
      1,
      "Password is required",
    ),
});

export type LoginRequest =
  z.infer<typeof loginSchema>;