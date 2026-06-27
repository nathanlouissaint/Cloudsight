import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ForecastMetricGrid({
  children,
}: Props) {
  return (
    <div
      className="summary-grid"
      style={{
        marginTop: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}
