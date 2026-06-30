import type { ReactNode } from "react";

import Card from "../layout/Card";

interface ExecutiveCardProps {
  title: string;
  eyebrow?: string;
  status?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ExecutiveCard({
  title,
  eyebrow,
  status,
  children,
  className,
}: ExecutiveCardProps) {
  return (
    <Card
      variant="executive"
      className={className}
    >
      <div className="overview-header">
        <div>
          {eyebrow && (
            <p className="overview-label">
              {eyebrow}
            </p>
          )}

          <h1>{title}</h1>
        </div>

        {status}
      </div>

      {children}
    </Card>
  );
}
