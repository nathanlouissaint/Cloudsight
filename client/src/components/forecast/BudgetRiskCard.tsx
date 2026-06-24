interface Props {
  projectedVariance: number;
}

export default function BudgetRiskCard({
  projectedVariance,
}: Props) {
  const risk =
    projectedVariance < 0
      ? "High"
      : projectedVariance < 1000
      ? "Medium"
      : "Low";

  return (
    <div className="summary-card">
      <div className="summary-title">
        Budget Risk
      </div>

      <div className="summary-value">
        {risk}
      </div>
    </div>
  );
}
