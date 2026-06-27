import type {
  Alert,
} from "../../types/alerts";

interface Props {
  alerts: Alert[];
}

export default function AlertRecommendationPanel({
  alerts,
}: Props) {
  return (
    <div className="analytics-card">

      <h3>
        Recommended Actions
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          marginTop: "24px",
        }}
      >

        {alerts.map(alert => (

          <div
            key={alert.id}
          >

            <strong>
              {alert.title}
            </strong>

            <p
              style={{
                color:
                  "var(--text-muted)",
                marginTop: "8px",
                lineHeight: 1.6,
              }}
            >
              {alert.recommendation}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}
