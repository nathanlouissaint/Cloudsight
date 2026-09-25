import type {
  Request,

  Response,
} from "express";
import {
  randomUUID,
} from "node:crypto";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  getCostSummary,
} from "../aws/services/cost-explorer.service";

import {
  awsConnectionService,
} from "../aws/services/aws-connection.service";

import {
  prisma,
} from "../config/prisma";

async function getOrganizationIdForUser(
  userId: string,
): Promise<string | null> {
  const membership =
    await prisma.organizationMember.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "asc",
      },

      select: {
        organizationId: true,
      },
    });

  return membership?.organizationId ?? null;
}

export function isMockAwsVerificationEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.SPEND_GUARD_MOCK_AWS ===
      "true"
  );
}

export async function getAwsCosts(
  _req: Request,
  res: Response,
) {
  try {
    const data =
      await getCostSummary();

    return res.status(200).json(data);
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message:
        "Failed to retrieve AWS costs",
      error:
        error?.message ??
        "Unknown error",
      stack:
        process.env.NODE_ENV !==
        "production"
          ? error?.stack
          : undefined,
    });
  }
}

export async function verifyAwsConnection(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const organizationId =
      await getOrganizationIdForUser(userId);

    if (!organizationId) {
      return res.status(403).json({
        message:
          "No organization is associated with this account.",
      });
    }

    const { roleArn } = req.body;

    if (
      typeof roleArn !== "string" ||
      !roleArn.trim()
    ) {
      return res.status(400).json({
        connected: false,
        message: "IAM role ARN is required.",
      });
    }

    const normalizedRoleArn =
      roleArn.trim();

    if (
      !/^arn:aws:iam::\d{12}:role\/.+$/.test(
        normalizedRoleArn,
      )
    ) {
      return res.status(400).json({
        connected: false,
        message: "Invalid IAM role ARN.",
      });
    }

    const mockAwsEnabled =
      isMockAwsVerificationEnabled();

    let accountId: string;
    let assumedRoleArn: string;

    if (mockAwsEnabled) {
      const mockAccountId =
        normalizedRoleArn.match(
          /^arn:aws:iam::(\d{12}):role\//,
        )?.[1];

      if (!mockAccountId) {
        return res.status(400).json({
          connected: false,
          message:
            "Unable to determine AWS account ID from role ARN.",
        });
      }

      const roleName =
        normalizedRoleArn
          .split(":role/")[1]
          ?.split("/")
          .at(-1) ??
        "CloudSightReadOnly";

      accountId = mockAccountId;
      assumedRoleArn =
        `arn:aws:sts::${accountId}:assumed-role/${roleName}/cloudsight-spend-guard`;
    } else {
      const connection =
        await awsConnectionService.verifyRole(
          normalizedRoleArn,
        );

      accountId = connection.accountId;
      assumedRoleArn = connection.assumedRoleArn;
    }

    const existingAccount =
      await prisma.cloudAccount.findUnique({
        where: {
          awsAccountId: accountId,
        },
      });

    if (
      existingAccount &&
      existingAccount.organizationId !==
        organizationId
    ) {
      return res.status(409).json({
        connected: false,
        message:
          "This AWS account is already connected to another organization.",
      });
    }

    const verifiedAt =
      new Date();

    const connectionStatus =
      mockAwsEnabled
        ? "MOCK_VERIFIED"
        : "VERIFIED";

    const accountData = {
      accountName:
        `AWS Account ${accountId}`,
      roleArn: normalizedRoleArn,
      isActive: true,
      connectionStatus,
      connectionError: null,
      lastVerifiedAt: verifiedAt,
      updatedAt: verifiedAt,
    };

    const cloudAccount = existingAccount
      ? await prisma.cloudAccount.update({
          where: {
            id: existingAccount.id,
          },
          data: accountData,
        })
      : await prisma.cloudAccount.create({
          data: {
            id: randomUUID(),
            organizationId,
            awsAccountId: accountId,
            externalId: null,
            ...accountData,
          },
        });

    return res.status(200).json({
      connected: true,
      accountId: cloudAccount.awsAccountId,
      accountName: cloudAccount.accountName,
      roleArn: cloudAccount.roleArn,
      assumedRoleArn,
      connectionStatus: cloudAccount.connectionStatus,
      lastVerifiedAt: cloudAccount.lastVerifiedAt,
      mocked: mockAwsEnabled,
    });
  } catch (error: unknown) {
    console.error(
      "AWS connection verification failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown AWS error";

    return res.status(400).json({
      connected: false,
      message:
        "Unable to verify AWS connection.",
      error:
        process.env.NODE_ENV !== "production"
          ? message
          : undefined,
    });
  }
}

export async function getAwsConnection(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const userId =
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const organizationId =
      await getOrganizationIdForUser(userId);

    if (!organizationId) {
      return res.status(403).json({
        message:
          "No organization is associated with this account.",
      });
    }

    const cloudAccount =
      await prisma.cloudAccount.findFirst({
        where: {
          organizationId,
          isActive: true,
        },

        orderBy: {
          lastVerifiedAt: "desc",
        },
      });

    if (!cloudAccount) {
      return res.status(200).json({
        configured: false,
      });
    }

    return res.status(200).json({
      configured: true,
      accountId: cloudAccount.awsAccountId,
      accountName: cloudAccount.accountName,
      roleArn: cloudAccount.roleArn,
      connectionStatus: cloudAccount.connectionStatus,
      lastVerifiedAt: cloudAccount.lastVerifiedAt,
    });
  } catch (error) {
    console.error(
      "AWS connection lookup failed:",
      error,
    );

    return res.status(500).json({
      message:
        "Unable to load AWS connection.",
    });
  }
}
