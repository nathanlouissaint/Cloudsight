import type {
  ReactNode,
} from "react";

interface Props {
  children: ReactNode;
}

export default function MetricGrid({
  children,
}: Props) {
  return (
    <div
      className="forecast-grid"
      style={{
        marginTop: "20px",
      }}
    >
      {children}
    </div>
  );
}
