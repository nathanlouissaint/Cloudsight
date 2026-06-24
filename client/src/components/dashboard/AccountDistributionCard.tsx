import { motion } from "framer-motion";

import {
  useAccountsAnalytics,
} from "../../hooks/useAccountsAnalytics";

export default function AccountDistributionCard() {
  const {
    data,
    isLoading,
  } =
    useAccountsAnalytics();

  if (isLoading || !data) {
    return null;
  }

  const totalSpend =
    data.accounts.reduce(
      (sum, account) =>
        sum + account.totalCost,
      0
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="analytics-card"
    >
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Account Distribution
          </div>

          <div className="analytics-subtitle">
            Spend by AWS account
          </div>
        </div>
      </div>

      <div className="service-list">
        {data.accounts.map(
          (account) => {
            const percentage =
              (
                (account.totalCost /
                  totalSpend) *
                100
              ).toFixed(1);

            return (
              <div
                key={
                  account.accountId
                }
                className="service-row"
              >
                <div className="service-name">
                  {
                    account.accountName
                  }
                </div>

                <div className="service-bar-wrapper">
                  <div
                    className="service-bar"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="service-value">
                  $
                  {account.totalCost.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </div>

                <div className="service-percent">
                  {percentage}%
                </div>
              </div>
            );
          }
        )}
      </div>
    </motion.div>
  );
}
