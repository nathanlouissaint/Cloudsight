import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/auth.context";
import { analytics } from "../../lib/analytics";
import "../../styles/spend-guard/funnel.css";

export default function SpendGuardLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login({ email: email.trim(), password });
      analytics.identify(user.id, { source: "spend_guard" });
      const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(destination ?? "/spend-guard/setup", { replace: true });
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="sg-signup">
      <div className="sg-signup__glow" />
      <header className="sg-signup__topbar">
        <Link to="/spend-guard" className="sg-signup__brand">
          <span className="sg-signup__brand-mark">C</span>
          <span>CloudSight</span>
        </Link>
        <span className="sg-signup__product">Spend Guard</span>
      </header>
      <div className="sg-signup__container">
        <section className="sg-signup__marketing">
          <p className="sg-signup__eyebrow">CLOUDSIGHT SPEND GUARD</p>
          <h1 className="sg-signup__headline">Welcome back to <span>Spend Guard.</span></h1>
          <p className="sg-signup__intro">Sign in to continue your AWS budget risk setup.</p>
        </section>
        <section className="sg-signup__card">
          <div className="sg-signup__card-header">
            <p className="sg-signup__card-eyebrow">ACCOUNT ACCESS</p>
            <h2>Sign in</h2>
            <p>Continue to your Spend Guard workspace.</p>
          </div>
          <form className="sg-signup__form" onSubmit={handleSubmit}>
            <label className="sg-signup__field">
              <span>Work email</span>
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="sg-signup__field">
              <span>Password</span>
              <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="sg-signup__error">{error}</p> : null}
            <button className="sg-signup__submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="sg-signup__trust">
            Need an account? <Link to="/spend-guard/signup">Create one</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
