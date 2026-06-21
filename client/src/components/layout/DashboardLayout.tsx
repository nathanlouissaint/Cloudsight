import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-background" />

      <main className="dashboard-container">
        {children}
      </main>
    </div>
  );
}