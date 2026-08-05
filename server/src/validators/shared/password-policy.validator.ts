import { z } from "zod";

export const passwordPolicy = z
  .string()
  .min(
    8,
    "Password must be at least 8 characters",
  )
  .max(
    128,
    "Password must be 128 characters or fewer",
  );