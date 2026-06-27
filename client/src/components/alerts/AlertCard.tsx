import type {
  Alert,
} from "../../types/alerts";

interface Props {
  alert: Alert;
}

export default function AlertCard({
  alert,
}: Props) {
  return (
    <div
      style={{
        borderBottom:
          "1px solid rgba(255,255,255,.06)",
        paddingBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
        }}
      >
        <div>
          <h3>{alert.title}</h3>

          <p
            style={{
              color:
                "var(--text-muted)",
              marginTop: "6px",
            }}
          >
            {alert.description}
          </p>
        </div>

        <span
          className={`status-chip ${alert.severity}`}
        >
          {alert.severity}
        </span>
      </div>

      <div
        className="forecast-grid"
        style={{
          marginTop: "20px",
        }}
      >
        <div>
          <span className="metric-label">
            Status
          </span>

          <strong className="metric-small">
            {alert.status}
          </strong>
        </div>

        <div>
          <span className="metric-label">
            Metric
          </span>

          <strong className="metric-small">
            {alert.metric}
          </strong>
        </div>

        <div>
          <span className="metric-label">
            Current
          </span>

          <strong className="metric-small">
            $
            {alert.currentValue.toLocaleString()}
          </strong>
        </div>

        <div>
          <span className="metric-label">
            Threshold
          </span>

          <strong className="metric-small">
            $
            {alert.threshold.toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
}
