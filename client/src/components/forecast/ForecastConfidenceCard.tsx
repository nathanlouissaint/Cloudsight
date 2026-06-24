interface Props {
  confidence: number;
}

export default function ForecastConfidenceCard({
  confidence,
}: Props) {
  return (
    <div className="summary-card">
      <div className="summary-title">
        Forecast Confidence
      </div>

      <div className="summary-value">
        {confidence}%
      </div>
    </div>
  );
}
