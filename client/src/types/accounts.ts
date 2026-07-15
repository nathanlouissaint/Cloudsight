export interface AccountAnalytics {
  accountId: string;
  accountName: string;
  totalCost: number;
}

export interface AccountsResponse {
  startDate: string;
  endDate: string;
  accountCount: number;
  accounts: AccountAnalytics[];
}
