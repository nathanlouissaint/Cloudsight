import Card from "../layout/Card";

interface MetricCardProps {
  label?: string;
  title?: string;
  value: string;

  subtitle?: string;

  trend?: string;

  className?: string;
}

export default function MetricCard({
  label,
  title,
  value,
  subtitle,
  trend,
  className,
}: MetricCardProps) {
  const heading = label ?? title ?? "";

  return (
    <Card
      variant="summary"
      className={className}
    >
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="metric-card-label">
            {heading}
          </span>
        </div>

        <div className="metric-card-value">
          {value}
        </div>

        {subtitle && (
          <div className="metric-card-subtitle">
            {subtitle}
          </div>
        )}

        {trend && (
          <div className="metric-card-trend">
            {trend}
          </div>
        )}
      </div>
    </Card>
  );
}
