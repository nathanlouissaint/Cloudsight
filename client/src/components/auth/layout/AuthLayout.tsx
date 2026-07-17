import type { ReactNode } from "react";

import AuthMarketing from "../marketing/AuthMarketing";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <aside
        className="auth-layout__marketing"
        aria-label="CloudSight product information"
      >
        <AuthMarketing />
      </aside>

      <section className="auth-layout__content">
        <div className="auth-card">
          {children}
        </div>
      </section>
    </main>
  );
}
