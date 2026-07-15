interface Props {
  title: string;
}

export default function EmptyState({
  title,
}: Props) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>No data is available for the selected reporting period.</p>
    </div>
  );
}
