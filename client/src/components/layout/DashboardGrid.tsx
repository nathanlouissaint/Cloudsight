import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function DashboardGrid({
  children,
}: Props) {
  return (
    <section className="dashboard-grid">
      {children}
    </section>
  );
}
