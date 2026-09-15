import type {
  Request,
  Response,
} from "express";

import {
  getCostSummary,
} from "../aws/services/cost-explorer.service";

import {
  awsConnectionService,
} from "../aws/services/aws-connection.service";

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
  req: Request,
  res: Response,
) {
  try {
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
      process.env.NODE_ENV !== "production" &&
      process.env.SPEND_GUARD_MOCK_AWS ===
        "true";

    if (mockAwsEnabled) {
      const accountId =
        normalizedRoleArn.match(
          /^arn:aws:iam::(\d{12}):role\//,
        )?.[1];

      if (!accountId) {
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

      return res.status(200).json({
        connected: true,
        accountId,
        roleArn: normalizedRoleArn,
        assumedRoleArn:
          `arn:aws:sts::${accountId}:assumed-role/${roleName}/cloudsight-spend-guard`,
        mocked: true,
      });
    }

    const connection =
      await awsConnectionService.verifyRole(
        normalizedRoleArn,
      );

    return res.status(200).json({
      connected: true,
      accountId: connection.accountId,
      roleArn: connection.roleArn,
      assumedRoleArn:
        connection.assumedRoleArn,
      mocked: false,
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