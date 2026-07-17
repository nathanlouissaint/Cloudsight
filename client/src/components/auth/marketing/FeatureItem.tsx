import type { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureItem({
  icon: Icon,
  title,
  description,
}: FeatureItemProps) {
  return (
    <article className="auth-feature">
      <div className="auth-feature__icon">
        <Icon
          size={20}
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </article>
  );
}
