import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function ForecastSection({
  title,
  children,
}: Props) {
  return (
    <section
      style={{
        marginTop: "3rem",
      }}
    >
      <h2>{title}</h2>

      {children}
    </section>
  );
}
