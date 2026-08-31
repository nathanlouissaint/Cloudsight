import type {
  Response,
} from "express";

import type {
  OrganizationAuthenticatedRequest,
} from "../types/organization/request.types";

import {
  addCloudAccount,
  CloudAccountError,
  disconnectCloudAccountForOrganization,
  listCloudAccounts,
  reconnectCloudAccountForOrganization,
  renameCloudAccount,
} from "../services/cloud-account.service";

function handleCloudAccountError(
  error: unknown,
  res: Response,
  fallbackMessage: string,
) {
  if (error instanceof CloudAccountError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  console.error(
    fallbackMessage,
    error,
  );

  res.status(500).json({
    message: fallbackMessage,
  });
}

function requireOrganization(
  req: OrganizationAuthenticatedRequest,
  res: Response,
): string | null {
  if (!req.organization) {
    res.status(400).json({
      message:
        "Organization context is required",
    });

    return null;
  }

  return req.organization.id;
}

export async function getCloudAccounts(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      requireOrganization(req, res);

    if (!organizationId) {
      return;
    }

    const accounts =
      await listCloudAccounts(
        organizationId,
      );

    res.status(200).json({
      accounts,
    });
  } catch (error) {
    handleCloudAccountError(
      error,
      res,
      "Failed to load cloud accounts",
    );
  }
}

export async function createCloudAccountController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      requireOrganization(req, res);

    if (!organizationId) {
      return;
    }

    const awsAccountId =
      typeof req.body?.awsAccountId ===
      "string"
        ? req.body.awsAccountId
        : "";

    const accountName =
      typeof req.body?.accountName ===
      "string"
        ? req.body.accountName
        : "";

    const account =
      await addCloudAccount(
        organizationId,
        awsAccountId,
        accountName,
      );

    res.status(201).json({
      account,
    });
  } catch (error) {
    handleCloudAccountError(
      error,
      res,
      "Failed to create cloud account",
    );
  }
}

export async function updateCloudAccountController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      requireOrganization(req, res);

    if (!organizationId) {
      return;
    }

    const accountId =
      String(req.params.accountId);

    const accountName =
      typeof req.body?.accountName ===
      "string"
        ? req.body.accountName
        : "";

    const account =
      await renameCloudAccount(
        organizationId,
        accountId,
        accountName,
      );

    res.status(200).json({
      account,
    });
  } catch (error) {
    handleCloudAccountError(
      error,
      res,
      "Failed to update cloud account",
    );
  }
}

export async function disconnectCloudAccountController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      requireOrganization(req, res);

    if (!organizationId) {
      return;
    }

    const accountId =
      String(req.params.accountId);

    const account =
      await disconnectCloudAccountForOrganization(
        organizationId,
        accountId,
      );

    res.status(200).json({
      account,
    });
  } catch (error) {
    handleCloudAccountError(
      error,
      res,
      "Failed to disconnect cloud account",
    );
  }
}

export async function reconnectCloudAccountController(
  req: OrganizationAuthenticatedRequest,
  res: Response,
) {
  try {
    const organizationId =
      requireOrganization(req, res);

    if (!organizationId) {
      return;
    }

    const accountId =
      String(req.params.accountId);

    const account =
      await reconnectCloudAccountForOrganization(
        organizationId,
        accountId,
      );

    res.status(200).json({
      account,
    });
  } catch (error) {
    handleCloudAccountError(
      error,
      res,
      "Failed to reconnect cloud account",
    );
  }
}
