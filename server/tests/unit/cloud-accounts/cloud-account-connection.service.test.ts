import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { prisma } from "../../../src/config/prisma";

import {
  configureAwsConnection,
  verifyCloudAccountAwsConnection,
} from "../../../src/services/cloud-account.service";

const dbDescribe =
  process.env.TEST_DATABASE_URL
    ? describe
    : describe.skip;

const prefix =
  `cloud-connection-service-${Date.now()}`;

dbDescribe(
  "cloud account connection service",
  () => {
    let organizationId: string;
    let accountId: string;

    beforeAll(async () => {
      await prisma.$connect();

      const user =
        await prisma.user.create({
          data: {
            email:
              `${prefix}@example.test`,
          },
        });

      const organization =
        await prisma.organization.create({
          data: {
            name:
              "Connection Service Test",
            slug:
              prefix,
          },
        });

      organizationId =
        organization.id;

      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: user.id,
          role: "OWNER",
        },
      });

      const account =
        await prisma.cloudAccount.create({
          data: {
            organizationId,
            awsAccountId:
              "123456789012",
            accountName:
              "Production",
          },
        });

      accountId =
        account.id;
    });

    afterAll(async () => {
      await prisma.cloudAccount.deleteMany({
        where: {
          organizationId,
        },
      });

      await prisma.organizationMember.deleteMany({
        where: {
          organizationId,
        },
      });

      await prisma.organization.deleteMany({
        where: {
          id:
            organizationId,
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            startsWith:
              prefix,
          },
        },
      });

      await prisma.$disconnect();
    });

    it(
      "configures a role and generates an external ID",
      async () => {
        const account =
          await configureAwsConnection(
            organizationId,
            accountId,
            "arn:aws:iam::123456789012:role/CloudSightReadRole",
          );

        expect(account.roleArn).toBe(
          "arn:aws:iam::123456789012:role/CloudSightReadRole",
        );

        expect(account.externalId).toMatch(
          /^[a-f0-9]{64}$/,
        );

        expect(
          account.connectionStatus,
        ).toBe("PENDING");

        expect(
          account.connectionError,
        ).toBeNull();
      },
    );

    it(
      "preserves the external ID during reconfiguration",
      async () => {
        const before =
          await prisma.cloudAccount.findUniqueOrThrow({
            where: {
              id:
                accountId,
            },
          });

        const updated =
          await configureAwsConnection(
            organizationId,
            accountId,
            "arn:aws:iam::123456789012:role/CloudSightUpdatedRole",
          );

        expect(
          updated.externalId,
        ).toBe(
          before.externalId,
        );
      },
    );

    it(
      "rejects a role ARN belonging to another AWS account",
      async () => {
        await expect(
          configureAwsConnection(
            organizationId,
            accountId,
            "arn:aws:iam::999999999999:role/CloudSightReadRole",
          ),
        ).rejects.toMatchObject({
          statusCode: 400,
        });
      },
    );

    it(
      "stores CONNECTED after successful verification",
      async () => {
        const verifyConnection =
          vi.fn().mockResolvedValue({
            accountId:
              "123456789012",
            arn:
              "arn:aws:sts::123456789012:assumed-role/CloudSightUpdatedRole/cloudsight-account-verification",
          });

        const result =
          await verifyCloudAccountAwsConnection(
            organizationId,
            accountId,
            verifyConnection,
          );

        expect(
          result.account.connectionStatus,
        ).toBe("CONNECTED");

        expect(
          result.account.lastVerifiedAt,
        ).toBeInstanceOf(Date);

        expect(
          result.account.connectionError,
        ).toBeNull();

        expect(
          verifyConnection,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "stores ERROR after failed verification",
      async () => {
        const verifyConnection =
          vi.fn().mockRejectedValue(
            new Error(
              "AccessDenied: role trust policy rejected CloudSight",
            ),
          );

        await expect(
          verifyCloudAccountAwsConnection(
            organizationId,
            accountId,
            verifyConnection,
          ),
        ).rejects.toMatchObject({
          statusCode: 502,
        });

        const stored =
          await prisma.cloudAccount.findUniqueOrThrow({
            where: {
              id:
                accountId,
            },
          });

        expect(
          stored.connectionStatus,
        ).toBe("ERROR");

        expect(
          stored.connectionError,
        ).toContain(
          "AccessDenied",
        );

        expect(
          stored.lastVerifiedAt,
        ).toBeNull();
      },
    );
  },
);
