import clsx from "clsx";
import type { ReactNode } from "react";

type CardVariant =
  | "default"
  | "analytics"
  | "summary"
  | "executive"
  | "glass";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

export default function Card({
  children,
  variant = "default",
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        "card",
        `card--${variant}`,
        className
      )}
    >
      {children}
    </div>
  );
}
