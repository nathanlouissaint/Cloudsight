export default function BudgetHealthCard() {
  const percent = 61.37;

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
            <span>{percent}%</span>
          </div>
        </div>
      </div>

      <div className="budget-stats">
        <div>
          <span>Budget</span>
          <strong>$5,000</strong>
        </div>

        <div>
          <span>Spent</span>
          <strong>$3,068</strong>
        </div>

        <div>
          <span>Remaining</span>
          <strong>$1,932</strong>
        </div>
      </div>

      <div className="status-chip healthy">
        Healthy
      </div>
    </div>
  );
}