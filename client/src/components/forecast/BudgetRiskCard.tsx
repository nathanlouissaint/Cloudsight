interface Props {
  projectedVariance: number;
  budget: number;
}

export default function BudgetRiskCard({
  projectedVariance,
  budget,
}: Props) {
  const amountOverBudget =
    projectedVariance < 0
      ? Math.abs(projectedVariance)
      : 0;

  const percentOverBudget =
    budget > 0
      ? (amountOverBudget / budget) * 100
      : 0;

  let risk = "Low";

  if (percentOverBudget >= 15) {
    risk = "High";
  } else if (percentOverBudget >= 5) {
    risk = "Medium";
  }

  return (
    <div className="summary-card">
      <div className="summary-title">
        Budget Risk
      </div>

      <div className="summary-value">
        {risk}
      </div>

      <div
        style={{
          marginTop: ".5rem",
          opacity: 0.7,
          fontSize: ".9rem",
        }}
      >
        {percentOverBudget.toFixed(1)}% over budget
      </div>
    </div>
  );
}
