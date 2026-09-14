import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/spend-guard/funnel.css";

export default function SpendGuardSignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [company, setCompany] = useState("");
  const [awsSpendRange, setAwsSpendRange] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !workEmail || !company || !awsSpendRange) {
      return;
    }

    setSubmitting(true);

    sessionStorage.setItem(
      "spendGuardBetaLead",
      JSON.stringify({
        name,
        workEmail,
        company,
        awsSpendRange,
      }),
    );

    navigate("/spend-guard/setup");
  }

  return (
    <main className="spend-guard-signup">
      <div className="spend-guard-signup__container">
        <div className="spend-guard-signup__copy">
          <p className="spend-guard-signup__eyebrow">
            CLOUDSIGHT SPEND GUARD
          </p>

          <h1>
            Get early access to AWS budget risk monitoring.
          </h1>

          <p>
            Join the private beta and set up your first Spend Guard monitor.
          </p>
        </div>

        <form
          className="spend-guard-signup__form"
          onSubmit={handleSubmit}
        >
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nathan Louissaint"
              required
            />
          </label>

          <label>
            Work email
            <input
              type="email"
              value={workEmail}
              onChange={(event) => setWorkEmail(event.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>

          <label>
            Company
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company name"
              required
            />
          </label>

          <label>
            Monthly AWS spend
            <select
              value={awsSpendRange}
              onChange={(event) => setAwsSpendRange(event.target.value)}
              required
            >
              <option value="">Select range</option>
              <option value="<5k">Under $5k</option>
              <option value="5k-20k">$5k–$20k</option>
              <option value="20k-50k">$20k–$50k</option>
              <option value="50k-100k">$50k–$100k</option>
              <option value="100k+">$100k+</option>
            </select>
          </label>

          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            {submitting ? "Continuing..." : "Continue to setup"}
          </button>

          <p className="spend-guard-signup__trust">
            No credit card required · Private beta
          </p>
        </form>
      </div>
    </main>
  );
}
