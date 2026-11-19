import crypto from "node:crypto";

/** Authenticates only the isolated crawler's narrow job/result API. */
export function auditWorkerBrokerAuthorized(authorization: string | undefined, secret = process.env.AUDIT_WORKER_BROKER_TOKEN) {
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}
