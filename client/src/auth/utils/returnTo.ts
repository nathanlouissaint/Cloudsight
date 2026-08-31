export function getSafeReturnTo(
  value: string | null,
  fallback = "/",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback;
  }

  return value;
}

export function buildAuthPath(
  path: "/login" | "/register",
  returnTo: string,
): string {
  const params = new URLSearchParams({
    returnTo,
  });

  return `${path}?${params.toString()}`;
}
