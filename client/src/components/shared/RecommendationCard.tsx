interface Props {
  title: string;
  description: string;
}

export default function RecommendationCard({
  title,
  description,
}: Props) {
  return (
    <div>

      <strong>
        {title}
      </strong>

      <p
        style={{
          color:
            "var(--text-muted)",
          marginTop: "8px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

    </div>
  );
}
