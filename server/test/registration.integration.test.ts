import assert from "node:assert/strict";
import {
  after,
  afterEach,
  before,
  test,
} from "node:test";
import {
  randomUUID,
} from "node:crypto";
import type {
  AddressInfo,
} from "node:net";

import type {
  Server,
} from "node:http";

import app from "../src/app";
import {
  prisma,
} from "../src/config/prisma";

const testRunId =
  randomUUID();

const emailPrefix =
  `spend-guard-registration-${testRunId}`;

const companyPrefix =
  `Spend Guard Registration ${testRunId}`;

let server: Server;
let baseUrl: string;

function registrationPayload(
  suffix: string,
) {
  return {
    email:
      `${emailPrefix}-${suffix}@example.test`,

    password:
      "correct-horse-battery-staple",

    name:
      "Spend Guard Tester",

    company:
      `${companyPrefix} ${suffix}`,
  };
}

async function register(
  payload: ReturnType<typeof registrationPayload>,
) {
  const response =
    await fetch(
      `${baseUrl}/auth/register`,
      {
        method: "POST",

        headers: {
          "content-type":
            "application/json",
        },

        body:
          JSON.stringify(payload),
      },
    );

  return {
    response,
    body:
      await response.json() as Record<string, unknown>,
  };
}

async function cleanTestData() {
  await prisma.organization.deleteMany({
    where: {
      name: {
        startsWith:
          companyPrefix,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith:
          emailPrefix,
      },
    },
  });
}

before(async () => {
  if (
    !process.env.DATABASE_URL?.includes(
      "cloudsight_test",
    )
  ) {
    throw new Error(
      "Registration integration tests require cloudsight_test.",
    );
  }

  process.env.JWT_SECRET =
    "registration-integration-test-secret";

  server =
    app.listen(0);

  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });

  const address =
    server.address() as AddressInfo;

  baseUrl =
    `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await cleanTestData();
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  await prisma.$disconnect();
});

test("register provisions an owner organization atomically", async () => {
  const payload =
    registrationPayload("success");

  const {
    response,
    body,
  } = await register(payload);

  assert.equal(response.status, 201);
  assert.equal(typeof body.token, "string");

  const user =
    body.user as {
      id: string;
      email: string;
    };

  const organization =
    body.organization as {
      id: string;
      name: string;
      slug: string;
    };

  assert.deepEqual(user, {
    id: user.id,
    email: payload.email,
  });
  assert.deepEqual(organization, {
    id: organization.id,
    name: payload.company,
    slug: organization.slug,
  });

  const persistedUser =
    await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

  const persistedOrganization =
    await prisma.organization.findUnique({
      where: {
        id: organization.id,
      },
    });

  const membership =
    await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId:
            organization.id,
          userId:
            user.id,
        },
      },
    });

  assert.equal(persistedUser?.email, payload.email);
  assert.equal(
    persistedOrganization?.name,
    payload.company,
  );
  assert.equal(membership?.role, "OWNER");
  assert.equal(membership?.userId, user.id);
  assert.equal(
    membership?.organizationId,
    organization.id,
  );
});

test("register rejects an email that already exists", async () => {
  const payload =
    registrationPayload("existing");

  await prisma.user.create({
    data: {
      email: payload.email,
      passwordHash: "existing-password-hash",
    },
  });

  const organizationsBefore =
    await prisma.organization.count();

  const membersBefore =
    await prisma.organizationMember.count();

  const {
    response,
    body,
  } = await register(payload);

  assert.equal(response.status, 409);
  assert.deepEqual(body, {
    message: "User already exists",
  });
  assert.equal(
    await prisma.organization.count(),
    organizationsBefore,
  );
  assert.equal(
    await prisma.organizationMember.count(),
    membersBefore,
  );
});

test("register maps a User.email transaction race to 409 without orphans", async () => {
  const payload =
    registrationPayload("race");

  const organizationsBefore =
    await prisma.organization.count();

  const membersBefore =
    await prisma.organizationMember.count();

  const userDelegate =
    prisma.user as typeof prisma.user & {
      findUnique: typeof prisma.user.findUnique;
    };

  const originalFindUnique =
    userDelegate.findUnique.bind(
      userDelegate,
    );

  let insertedCompetitor =
    false;

  userDelegate.findUnique = async (
    args,
  ) => {
    if (
      !insertedCompetitor &&
      args.where.email === payload.email
    ) {
      insertedCompetitor = true;

      await prisma.user.create({
        data: {
          email: payload.email,
          passwordHash:
            "concurrent-password-hash",
        },
      });

      return null;
    }

    return originalFindUnique(args);
  };

  try {
    const {
      response,
      body,
    } = await register(payload);

    assert.equal(response.status, 409);
    assert.deepEqual(body, {
      message: "User already exists",
    });
  } finally {
    userDelegate.findUnique =
      originalFindUnique;
  }

  assert.equal(insertedCompetitor, true);
  assert.equal(
    await prisma.organization.count(),
    organizationsBefore,
  );
  assert.equal(
    await prisma.organizationMember.count(),
    membersBefore,
  );
});

test("register rolls back User creation when organization provisioning fails", async () => {
  const payload =
    registrationPayload("rollback");

  const transactionClient =
    prisma as typeof prisma & {
      $transaction: typeof prisma.$transaction;
    };

  const originalTransaction =
    transactionClient.$transaction.bind(
      transactionClient,
    );

  transactionClient.$transaction = async (
    input,
    options,
  ) => {
    if (typeof input !== "function") {
      return originalTransaction(
        input,
        options,
      );
    }

    return originalTransaction(
      async (tx) => {
        const failingTransaction =
          new Proxy(tx, {
            get(target, property, receiver) {
              if (property === "organization") {
                return new Proxy(
                  target.organization,
                  {
                    get(
                      organizationTarget,
                      organizationProperty,
                      organizationReceiver,
                    ) {
                      if (organizationProperty === "create") {
                        return async () => {
                          throw new Error(
                            "Forced organization provisioning failure.",
                          );
                        };
                      }

                      return Reflect.get(
                        organizationTarget,
                        organizationProperty,
                        organizationReceiver,
                      );
                    },
                  },
                );
              }

              return Reflect.get(
                target,
                property,
                receiver,
              );
            },
          });

        return input(failingTransaction);
      },
      options,
    );
  };

  try {
    const {
      response,
    } = await register(payload);

    assert.equal(response.status, 500);
  } finally {
    transactionClient.$transaction =
      originalTransaction;
  }

  assert.equal(
    await prisma.user.count({
      where: {
        email: payload.email,
      },
    }),
    0,
  );
  assert.equal(
    await prisma.organization.count({
      where: {
        name: payload.company,
      },
    }),
    0,
  );
  assert.equal(
    await prisma.organizationMember.count({
      where: {
        User: {
          email: payload.email,
        },
      },
    }),
    0,
  );
});
