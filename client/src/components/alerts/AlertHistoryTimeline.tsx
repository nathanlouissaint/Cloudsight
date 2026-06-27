import type {
  AlertHistoryItem,
} from "../../types/alert-history";

import StatusChip from "../shared/StatusChip";

interface Props {
  history: AlertHistoryItem[];
}

function toVariant(
  severity: string
): "healthy" | "warning" | "critical" {

  switch (severity) {

    case "critical":
      return "critical";

    case "warning":
      return "warning";

    default:
      return "healthy";

  }

}

export default function AlertHistoryTimeline({
  history,
}: Props) {

  if (history.length === 0) {

    return (
      <div className="analytics-card">

        <h3>
          Alert History
        </h3>

        <p
          style={{
            marginTop: "20px",
            color: "var(--text-muted)",
          }}
        >
          No historical alerts available.
        </p>

      </div>
    );

  }

  return (

    <div className="analytics-card">

      <h3>
        Alert History
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "24px",
        }}
      >

        {history.map((item) => (

          <div
            key={item.id}
            style={{
              borderBottom:
                "1px solid rgba(255,255,255,.06)",
              paddingBottom: "20px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >

              <div>

                <strong>
                  {item.title}
                </strong>

                <p
                  style={{
                    marginTop: "8px",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.description}
                </p>

              </div>

              <StatusChip
                label={item.severity}
                variant={toVariant(
                  item.severity
                )}
              />

            </div>

            <div
              style={{
                marginTop: "16px",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              {new Date(
                item.occurredAt
              ).toLocaleString()}
            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
