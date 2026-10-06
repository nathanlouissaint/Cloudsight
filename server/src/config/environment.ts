function requireValue(
  name: string,
  value: string | undefined,
  errors: string[],
) {
  if (!value?.trim()) {
    errors.push(`${name} is required.`);
    return null;
  }

  return value.trim();
}

function requireUrl(
  name: string,
  value: string | undefined,
  protocol: string,
  errors: string[],
) {
  const configuredValue = requireValue(
    name,
    value,
    errors,
  );

  if (!configuredValue) {
    return;
  }

  try {
    const parsed = new URL(configuredValue);

    if (parsed.protocol !== protocol) {
      errors.push(
        `${name} must use the ${protocol} protocol.`,
      );
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

function requireCorsOrigin(
  value: string | undefined,
  errors: string[],
) {
  const configuredValue = requireValue(
    "CORS_ORIGIN",
    value,
    errors,
  );

  if (!configuredValue) {
    return;
  }

  try {
    const parsed = new URL(configuredValue);

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      parsed.origin !== configuredValue
    ) {
      errors.push(
        "CORS_ORIGIN must be a single HTTP(S) origin without a path.",
      );
    }
  } catch {
    errors.push(
      "CORS_ORIGIN must be a valid HTTP(S) origin.",
    );
  }
}

/**
 * Production configuration is intentionally validated before the server
 * accepts traffic. Development retains its existing local defaults.
 */
export function validateEnvironment() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const errors: string[] = [];

  if (
    process.env.SPEND_GUARD_MOCK_AWS?.trim().toLowerCase() === "true"
  ) {
    errors.push(
      "SPEND_GUARD_MOCK_AWS must not be enabled in production.",
    );
  }

  requireUrl(
    "DATABASE_URL",
    process.env.DATABASE_URL,
    "postgresql:",
    errors,
  );

  requireUrl(
    "REDIS_URL",
    process.env.REDIS_URL,
    "redis:",
    errors,
  );

  const jwtSecret = requireValue(
    "JWT_SECRET",
    process.env.JWT_SECRET,
    errors,
  );

  if (jwtSecret && jwtSecret.length < 32) {
    errors.push(
      "JWT_SECRET must be at least 32 characters.",
    );
  }

  requireCorsOrigin(process.env.CORS_ORIGIN, errors);

  requireValue(
    "AWS_REGION",
    process.env.AWS_REGION,
    errors,
  );

  const awsProvider = requireValue(
    "AWS_PROVIDER",
    process.env.AWS_PROVIDER,
    errors,
  );

  if (awsProvider && awsProvider !== "aws") {
    errors.push(
      "AWS_PROVIDER must be set to aws in production.",
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid production environment configuration: ${errors.join(" ")}`,
    );
  }
}
