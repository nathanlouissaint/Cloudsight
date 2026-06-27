interface Props {
  label: string;
  variant:
    | "healthy"
    | "warning"
    | "critical";
}

export default function StatusChip({
  label,
  variant,
}: Props) {
  return (
    <span
      className={`status-chip ${variant}`}
    >
      {label}
    </span>
  );
}
