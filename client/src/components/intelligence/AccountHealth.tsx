import { motion } from "framer-motion";

import { useAccountsAnalytics } from "../../hooks/useAccountsAnalytics";

export default function AccountHealth() {
  const { data, isLoading } =
    useAccountsAnalytics();

  if (isLoading || !data) {
    return null;
  }

  const maxSpend = Math.max(
    ...data.accounts.map(
      (account) => account.totalCost
    ),
    1
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="analytics-card"
    >
      <div className="analytics-title">
        Account Spend
      </div>

      <div className="analytics-subtitle">
        Current month spend across AWS accounts
      </div>

      {data.accounts.map((account) => {
        const utilization =
          (account.totalCost / maxSpend) *
          100;

        return (
          <div
            key={account.accountId}
            className="driver-row"
          >
            <div>
              {account.accountName}
            </div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              <strong>
                $
                {account.totalCost.toLocaleString()}
              </strong>

              <div
                className="forecast-progress"
                style={{
                  width: 80,
                  marginTop: 6,
                }}
              >
                <div
                  className="forecast-fill"
                  style={{
                    width: `${utilization}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}