import { useAlerts } from "../hooks/useAlerts";

export default function AlertsPage() {
  const {
    data,
    isLoading,
    error,
  } = useAlerts();

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">
          Alert Center
        </h1>

        <div className="analytics-card">
          <h3>System Healthy</h3>

          <p>
            No active alerts detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Alert Center
      </h1>

      <div className="space-y-4">
        {data.map((alert) => (
          <div
            key={alert.id}
            className="analytics-card"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3>{alert.title}</h3>

                <p>{alert.description}</p>
              </div>

              <span
                className={`status-chip ${
                  alert.severity
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              <div>
                <small>STATUS</small>

                <p>{alert.status}</p>
              </div>

              <div>
                <small>METRIC</small>

                <p>{alert.metric}</p>
              </div>

              <div>
                <small>CURRENT VALUE</small>

                <p>
                  $
                  {alert.currentValue.toLocaleString()}
                </p>
              </div>

              <div>
                <small>THRESHOLD</small>

                <p>
                  $
                  {alert.threshold.toLocaleString()}
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                borderRadius: "12px",
                background:
                  "rgba(59,130,246,.08)",
                border:
                  "1px solid rgba(59,130,246,.2)",
              }}
            >
              <strong>
                Recommendation
              </strong>

              <p
                style={{
                  marginTop: "8px",
                }}
              >
                {alert.recommendation}
              </p>
            </div>

            <p
              style={{
                marginTop: "20px",
                opacity: 0.7,
                fontSize: "13px",
              }}
            >
              {alert.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
