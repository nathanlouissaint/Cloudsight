import {
  apiRequest,
} from "../lib/apiClient";

import type {
  CloudAccountResponse,
  CloudAccountsResponse,
} from "./types";

export function getCloudAccounts() {
  return apiRequest<CloudAccountsResponse>(
    "/cloud-accounts",
  );
}

export function createCloudAccount(
  awsAccountId: string,
  accountName: string,
) {
  return apiRequest<CloudAccountResponse>(
    "/cloud-accounts",
    {
      method: "POST",
      body: JSON.stringify({
        awsAccountId,
        accountName,
      }),
    },
  );
}

export function renameCloudAccount(
  accountId: string,
  accountName: string,
) {
  return apiRequest<CloudAccountResponse>(
    `/cloud-accounts/${accountId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        accountName,
      }),
    },
  );
}

export function disconnectCloudAccount(
  accountId: string,
) {
  return apiRequest<CloudAccountResponse>(
    `/cloud-accounts/${accountId}/disconnect`,
    {
      method: "POST",
    },
  );
}

export function reconnectCloudAccount(
  accountId: string,
) {
  return apiRequest<CloudAccountResponse>(
    `/cloud-accounts/${accountId}/reconnect`,
    {
      method: "POST",
    },
  );
}

export function configureCloudAccountConnection(
  accountId: string,
  roleArn: string,
) {
  return apiRequest<CloudAccountResponse>(
    `/cloud-accounts/${accountId}/connection`,
    {
      method: "PATCH",
      body: JSON.stringify({
        roleArn,
      }),
    },
  );
}

export interface VerifyCloudAccountConnectionResponse {
  account: CloudAccountResponse["account"];
  identity: {
    accountId: string;
    arn: string | null;
  };
}

export function verifyCloudAccountConnection(
  accountId: string,
) {
  return apiRequest<VerifyCloudAccountConnectionResponse>(
    `/cloud-accounts/${accountId}/verify`,
    {
      method: "POST",
    },
  );
}
