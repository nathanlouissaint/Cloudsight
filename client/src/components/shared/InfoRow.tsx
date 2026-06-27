interface Props {
  label: string;
  value: string;
}

export default function InfoRow({
  label,
  value,
}: Props) {
  return (
    <div>
      <span className="metric-label">
        {label}
      </span>

      <strong className="metric-small">
        {value}
      </strong>
    </div>
  );
}
