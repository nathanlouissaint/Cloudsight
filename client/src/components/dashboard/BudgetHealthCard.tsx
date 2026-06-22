import { useReport } from "../../hooks/useReport";

export default function BudgetHealthCard() {
  const { data, loading } = useReport();

  if (loading || !data) {
    return null;
  }

  const percent =
    (data.totalSpend / data.budget) * 100;

  const remaining =
    data.budget - data.totalSpend;

  return (
    <div className="analytics-card budget-health-card">
      <div className="analytics-header">
        <div>
          <div className="analytics-title">
            Budget Health
          </div>

          <div className="analytics-subtitle">
            Current budget utilization
          </div>
        </div>
      </div>

      <div className="budget-circle-wrapper">
        <div
          className="budget-circle"
          style={{
            background: `conic-gradient(
              #22C55E ${percent * 3.6}deg,
              rgba(255,255,255,0.08) 0deg
            )`,
          }}
        >
          <div className="budget-circle-inner">
            <span>
              {percent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="budget-stats">
        <div>
          <span>Budget</span>
          <strong>
            ${data.budget.toLocaleString()}
          </strong>
        </div>

        <div>
          <span>Spent</span>
          <strong>
            ${data.totalSpend.toLocaleString()}
          </strong>
        </div>

        <div>
          <span>Remaining</span>
          <strong>
            ${remaining.toLocaleString()}
          </strong>
        </div>
      </div>

      <div
        className={`status-chip ${data.budgetStatus}`}
      >
        {data.budgetStatus}
      </div>
    </div>
  );
}
