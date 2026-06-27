import type {
  ForecastConfidence,
  ForecastInsight,
  GrowthDriver,
} from "../../types/forecast";

interface Props {
  insights: ForecastInsight[];
  confidence: ForecastConfidence;
  topDriver?: GrowthDriver;
  explanation: string;
}

const severityLabels = {
  info: "Info",
  warning: "Warning",
  critical: "Critical",
};

const severityClassName = {
  info: "status-positive",
  warning: "status-negative",
  critical: "status-negative",
};

export default function ForecastInsights({
  insights,
  confidence,
  topDriver,
  explanation,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >

      <div className="summary-card">
        <div className="summary-title">
          Confidence Level
        </div>

        <div className="summary-value">
          {confidence.level}
        </div>

        <p className="summary-subtitle">
          {confidence.score}% confidence — {confidence.reason}
        </p>
      </div>

      {topDriver && (
        <div className="summary-card">
          <div className="summary-title">
            Primary Growth Driver
          </div>

          <div className="summary-value">
            {topDriver.name}
          </div>

          <p className="summary-subtitle">
            ${topDriver.impact.toLocaleString()} projected impact ·{" "}
            {topDriver.direction === "up"
              ? "Increasing spend"
              : "Decreasing spend"}
          </p>
        </div>
      )}

      <div className="summary-card">
        <div className="summary-title">
          Forecast Explanation
        </div>

        <p className="summary-subtitle">
          {explanation}
        </p>
      </div>

      {insights.map((insight) => (
        <div
          key={`${insight.type}-${insight.title}`}
          className="summary-card"
        >
          <div className="summary-top">
            <div>
              <div className="summary-title">
                {insight.type.toUpperCase()}
              </div>

              <h3>
                {insight.title}
              </h3>
            </div>

            <span
              className={
                severityClassName[insight.severity]
              }
            >
              {severityLabels[insight.severity]}
            </span>
          </div>

          <p className="summary-subtitle">
            {insight.message}
          </p>
        </div>
      ))}

    </div>
  );
}
