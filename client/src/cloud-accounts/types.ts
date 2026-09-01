export type CloudAccountConnectionStatus =
  | "NOT_CONFIGURED"
  | "PENDING"
  | "CONNECTED"
  | "ERROR";

export interface CloudAccount {
  id: string;
  organizationId: string;
  awsAccountId: string;
  accountName: string;

  isActive: boolean;
  disconnectedAt: string | null;

  roleArn: string | null;
  externalId: string | null;
  connectionStatus: CloudAccountConnectionStatus;
  lastVerifiedAt: string | null;
  connectionError: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CloudAccountsResponse {
  accounts: CloudAccount[];
}

export interface CloudAccountResponse {
  account: CloudAccount;
}
