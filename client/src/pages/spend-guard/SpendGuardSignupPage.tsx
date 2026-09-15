import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  registerSpendGuardUser,
} from "../../spend-guard/auth.api";

import "../../styles/spend-guard/funnel.css";

const benefits = [
  {
    icon: "01",
    title: "Proactive budget alerts",
    copy: "Catch AWS budget risk before the monthly bill arrives.",
  },
  {
    icon: "02",
    title: "Actionable cost insight",
    copy: "Understand which services are driving unexpected spend.",
  },
  {
    icon: "03",
    title: "Built for technical teams",
    copy: "Set up monitoring without adding another heavy FinOps workflow.",
  },
];

export default function SpendGuardSignupPage() {
  const navigate =
    useNavigate();

  const [
    name,
    setName,
  ] = useState("");

  const [
    workEmail,
    setWorkEmail,
  ] = useState("");

  const [
    company,
    setCompany,
  ] = useState("");

  const [
    awsSpendRange,
    setAwsSpendRange,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !workEmail.trim() ||
      !company.trim() ||
      !awsSpendRange ||
      password.length < 8
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const auth =
        await registerSpendGuardUser(
          workEmail.trim(),
          password,
        );

      sessionStorage.setItem(
        "cloudsightAccessToken",
        auth.token,
      );

      sessionStorage.setItem(
        "spendGuardBetaLead",
        JSON.stringify({
          name:
            name.trim(),
          workEmail:
            auth.user.email,
          company:
            company.trim(),
          awsSpendRange,
          userId:
            auth.user.id,
        }),
      );

      navigate(
        "/spend-guard/setup",
      );
    } catch (
      requestError: unknown
    ) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to create your account.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="sg-signup">
      <div className="sg-signup__glow" />

      <header className="sg-signup__topbar">
        <a
          href="/spend-guard"
          className="sg-signup__brand"
        >
          <span className="sg-signup__brand-mark">
            C
          </span>

          <span>
            CloudSight
          </span>
        </a>

        <span className="sg-signup__product">
          Spend Guard
        </span>
      </header>

      <div className="sg-signup__container">
        <section className="sg-signup__marketing">
          <p className="sg-signup__eyebrow">
            CLOUDSIGHT SPEND GUARD
          </p>

          <h1 className="sg-signup__headline">
            Get early access to AWS{" "}
            <span>
              budget risk
            </span>{" "}
            monitoring.
          </h1>

          <p className="sg-signup__intro">
            Join the private beta and set up your first
            Spend Guard monitor.
          </p>

          <div className="sg-signup__benefits">
            {benefits.map(
              (benefit) => (
                <div
                  key={benefit.icon}
                  className="sg-signup__benefit"
                >
                  <div className="sg-signup__benefit-icon">
                    {benefit.icon}
                  </div>

                  <div>
                    <strong>
                      {benefit.title}
                    </strong>

                    <p>
                      {benefit.copy}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="sg-signup__card">
          <div className="sg-signup__card-header">
            <p className="sg-signup__card-eyebrow">
              PRIVATE BETA
            </p>

            <h2>
              Create your account
            </h2>

            <p>
              Continue to Spend Guard setup after creating
              your account.
            </p>
          </div>

          <form
            className="sg-signup__form"
            onSubmit={handleSubmit}
          >
            <label className="sg-signup__field">
              <span>
                Name
              </span>

              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Your name"
                required
              />
            </label>

            <label className="sg-signup__field">
              <span>
                Work email
              </span>

              <input
                type="email"
                autoComplete="email"
                value={workEmail}
                onChange={(event) =>
                  setWorkEmail(
                    event.target.value,
                  )
                }
                placeholder="you@company.com"
                required
              />
            </label>

            <label className="sg-signup__field">
              <span>
                Company
              </span>

              <input
                type="text"
                autoComplete="organization"
                value={company}
                onChange={(event) =>
                  setCompany(
                    event.target.value,
                  )
                }
                placeholder="Company name"
                required
              />
            </label>

            <label className="sg-signup__field">
              <span>
                Monthly AWS spend
              </span>

              <div className="sg-signup__select-wrap">
                <select
                  value={awsSpendRange}
                  onChange={(event) =>
                    setAwsSpendRange(
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value="">
                    Select range
                  </option>

                  <option value="<5k">
                    Under $5k
                  </option>

                  <option value="5k-20k">
                    $5k–$20k
                  </option>

                  <option value="20k-50k">
                    $20k–$50k
                  </option>

                  <option value="50k-100k">
                    $50k–$100k
                  </option>

                  <option value="100k+">
                    $100k+
                  </option>
                </select>

                <span className="sg-signup__select-arrow">
                  ↓
                </span>
              </div>
            </label>

            <label className="sg-signup__field">
              <span>
                Password
              </span>

              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="Minimum 8 characters"
                required
              />
            </label>

            {error && (
              <div
                className="sg-signup__error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="sg-signup__submit"
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : "Continue to setup"}
            </button>

            <p className="sg-signup__trust">
              No credit card required · Private beta
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
