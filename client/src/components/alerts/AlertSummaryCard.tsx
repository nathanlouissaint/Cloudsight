interface Props {
  title: string;
  value: number;
  subtitle: string;
  severity:
    | "critical"
    | "warning"
    | "info";
}

export default function AlertSummaryCard({
  title,
  value,
  subtitle,
  severity,
}: Props) {
  const trendClass =
    severity === "critical"
      ? "trend-warning"
      : severity === "warning"
      ? "trend-warning"
      : "trend-positive";

  return (
    <div className="summary-card">
      <div className="summary-top">
        <div className="summary-title">
          {title}
        </div>
      </div>

      <div className="summary-value">
        {value}
      </div>

      <div
        className={trendClass}
      >
        {subtitle}
      </div>
    </div>
  );
}
