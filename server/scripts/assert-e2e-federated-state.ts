import { prisma } from "../src/config/prisma";
import { validateTestDatabaseUrl } from "../tests/integration/helpers/test-database";

async function main() {
  if (process.env.NODE_ENV !== "test") throw new Error("Test-only assertion");
  const url = validateTestDatabaseUrl();
  if (!url.includes("cloudsight_test")) throw new Error("Unsafe test database");

const email = process.argv[2];
if (!email) throw new Error("Federated email required");
const provider = process.argv[3] ?? "GOOGLE";
const issuer = provider === "MICROSOFT"
  ? "https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0"
  : provider === "GITHUB"
    ? "https://github.com"
    : "https://accounts.google.com";
const subject = provider === "MICROSOFT"
  ? "cloudsight-e2e-controlled-microsoft-subject"
  : provider === "GITHUB"
    ? "9001001"
    : "cloudsight-e2e-controlled-subject";
  const user = await prisma.user.findUnique({ where: { email } });
  const identity = await prisma.authIdentity.findUnique({
    where: { issuer_providerSubject: { issuer, providerSubject: subject } },
  });
  const sessions = user ? await prisma.session.count({ where: { userId: user.id } }) : 0;
  const users = await prisma.user.count({ where: { email } });
  const identities = await prisma.authIdentity.count({ where: { issuer, providerSubject: subject } });
  const activeSessions = user ? await prisma.session.count({ where: { userId: user.id, revokedAt: null } }) : 0;
  process.stdout.write(JSON.stringify({
    userId: user?.id ?? null,
    userEmail: user?.email ?? null,
    identityUserId: identity?.userId ?? null,
    providerKind: identity?.providerKind ?? null,
    issuer: identity?.issuer ?? null,
    providerSubject: identity?.providerSubject ?? null,
    providerEmail: identity?.providerEmail ?? null,
    users,
    identities,
    sessions,
    activeSessions,
    persistence: identity && user
      ? JSON.stringify({ user, identity, sessions: await prisma.session.findMany({ where: { userId: user.id } }) })
      : null,
  }));
  await prisma.$disconnect();
}

void main();
