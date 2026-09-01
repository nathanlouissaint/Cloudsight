export interface CloudAccount {
  id: string;
  organizationId: string;
  awsAccountId: string;
  accountName: string;
  isActive: boolean;
  disconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CloudAccountsResponse {
  accounts: CloudAccount[];
}

export interface CloudAccountResponse {
  account: CloudAccount;
}
