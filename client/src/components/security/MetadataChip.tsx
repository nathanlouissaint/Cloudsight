interface Props {
  label: string;
}

export default function MetadataChip({
  label,
}: Props) {
  return (
    <span className="metadata-chip">
      {label}
    </span>
  );
}