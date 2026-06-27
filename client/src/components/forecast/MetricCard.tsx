interface Props {
  title: string;
  value: string;
  subtitle?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <div className="summary-card">
      <div className="summary-title">
        {title}
      </div>

      <div className="summary-value">
        {value}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: ".5rem",
            opacity: 0.7,
            fontSize: ".9rem",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
