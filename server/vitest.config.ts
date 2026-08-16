import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 5_000,
    hookTimeout: 5_000,
    env: {
      NODE_ENV: "test",
      CSRF_SECRET: "vitest-only-csrf-secret-material-32-bytes",
      JWT_SECRET: "vitest-only-jwt-secret-material-32-bytes",
    },
  },
});
