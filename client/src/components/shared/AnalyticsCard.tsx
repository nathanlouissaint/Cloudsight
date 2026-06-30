import type { ReactNode } from "react";
import Card from "../layout/Card";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function AnalyticsCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: AnalyticsCardProps) {
  return (
    <Card
      variant="analytics"
      className={className}
    >
      <div className="analytics-header">
        <div>
          <h3 className="analytics-title">
            {title}
          </h3>

          {subtitle && (
            <p className="analytics-subtitle">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="analytics-actions">
            {actions}
          </div>
        )}
      </div>

      {children}
    </Card>
  );
}
