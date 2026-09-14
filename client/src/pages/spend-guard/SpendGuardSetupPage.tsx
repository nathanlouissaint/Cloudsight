import { useState } from "react";

import "../../styles/spend-guard/funnel.css";

type SetupStep = "aws" | "budget" | "analysis";

export default function SpendGuardSetupPage() {
  const [step, setStep] = useState<SetupStep>("aws");
  const [roleArn, setRoleArn] = useState("");
  const [budget, setBudget] = useState("");

  const stepNumber =
    step === "aws"
      ? 1
      : step === "budget"
        ? 2
        : 3;

  return (
    <main className="sg-onboarding">
      <div className="sg-onboarding__shell">
        <header className="sg-onboarding__topbar">
          <a
            href="/spend-guard"
            className="sg-onboarding__brand"
          >
            <span className="sg-onboarding__brand-mark">C</span>
            <span>CloudSight</span>
          </a>

          <span className="sg-onboarding__product">
            Spend Guard
          </span>
        </header>

        <div className="sg-onboarding__layout">
          <aside className="sg-onboarding__sidebar">
            <p className="sg-onboarding__eyebrow">
              SETUP
            </p>

            <h1>
              Get to your first AWS risk check.
            </h1>

            <p className="sg-onboarding__sidebar-copy">
              Three steps. Connect AWS, define the budget, then run your first
              spend-risk analysis.
            </p>

            <div className="sg-onboarding__steps">
              <div
                className={
                  stepNumber >= 1
                    ? "sg-step sg-step--active"
                    : "sg-step"
                }
              >
                <span className="sg-step__number">01</span>
                <div>
                  <strong>Connect AWS</strong>
                  <span>Read-only IAM role</span>
                </div>
              </div>

              <div
                className={
                  stepNumber >= 2
                    ? "sg-step sg-step--active"
                    : "sg-step"
                }
              >
                <span className="sg-step__number">02</span>
                <div>
                  <strong>Set budget</strong>
                  <span>Monthly spend target</span>
                </div>
              </div>

              <div
                className={
                  stepNumber >= 3
                    ? "sg-step sg-step--active"
                    : "sg-step"
                }
              >
                <span className="sg-step__number">03</span>
                <div>
                  <strong>Analyze</strong>
                  <span>Run first risk check</span>
                </div>
              </div>
            </div>
          </aside>

          <section className="sg-onboarding__workspace">
            <div className="sg-onboarding__progress">
              <div className="sg-onboarding__progress-top">
                <span>
                  Step {stepNumber} of 3
                </span>
                <span>
                  {Math.round((stepNumber / 3) * 100)}%
                </span>
              </div>

              <div className="sg-onboarding__progress-track">
                <div
                  className="sg-onboarding__progress-fill"
                  style={{
                    width: `${(stepNumber / 3) * 100}%`,
                  }}
                />
              </div>
            </div>

            {step === "aws" && (
              <div className="sg-onboarding__card">
                <div className="sg-onboarding__card-header">
                  <p className="sg-onboarding__label">
                    STEP 01
                  </p>

                  <h2>Connect your AWS account</h2>

                  <p>
                    Enter the IAM role ARN Spend Guard should use to access
                    read-only billing and cost data.
                  </p>
                </div>

                <div className="sg-onboarding__security-note">
                  <span className="sg-onboarding__status-dot" />
                  Read-only access · Temporary credentials · No infrastructure
                  control
                </div>

                <label className="sg-field">
                  <span>IAM Role ARN</span>

                  <input
                    type="text"
                    value={roleArn}
                    onChange={(event) =>
                      setRoleArn(event.target.value)
                    }
                    placeholder="arn:aws:iam::123456789012:role/CloudSightReadOnly"
                  />

                  <small>
                    You will create this role in AWS and paste the ARN here.
                  </small>
                </label>

                <div className="sg-onboarding__actions">
                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                    disabled={!roleArn.trim()}
                    onClick={() => setStep("budget")}
                  >
                    Verify connection
                  </button>
                </div>
              </div>
            )}

            {step === "budget" && (
              <div className="sg-onboarding__card">
                <div className="sg-onboarding__card-header">
                  <p className="sg-onboarding__label">
                    STEP 02
                  </p>

                  <h2>Set your monthly AWS budget</h2>

                  <p>
                    Spend Guard will compare projected month-end spend against
                    this amount.
                  </p>
                </div>

                <label className="sg-field">
                  <span>Monthly budget</span>

                  <div className="sg-field__currency">
                    <span>$</span>

                    <input
                      type="number"
                      min="1"
                      value={budget}
                      onChange={(event) =>
                        setBudget(event.target.value)
                      }
                      placeholder="50000"
                    />
                  </div>

                  <small>
                    You can change this later.
                  </small>
                </label>

                <div className="sg-onboarding__actions">
                  <button
                    type="button"
                    className="sg-button sg-button--secondary"
                    onClick={() => setStep("aws")}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                    disabled={!budget}
                    onClick={() => setStep("analysis")}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === "analysis" && (
              <div className="sg-onboarding__card">
                <div className="sg-onboarding__card-header">
                  <p className="sg-onboarding__label">
                    STEP 03
                  </p>

                  <h2>Ready for your first analysis</h2>

                  <p>
                    Review the setup below, then run Spend Guard against your
                    AWS account.
                  </p>
                </div>

                <div className="sg-review">
                  <div className="sg-review__row">
                    <span>AWS role</span>
                    <strong>{roleArn}</strong>
                  </div>

                  <div className="sg-review__row">
                    <span>Monthly budget</span>
                    <strong>
                      ${Number(budget || 0).toLocaleString()}
                    </strong>
                  </div>

                  <div className="sg-review__row">
                    <span>Monitoring mode</span>
                    <strong>Budget risk</strong>
                  </div>
                </div>

                <div className="sg-onboarding__actions">
                  <button
                    type="button"
                    className="sg-button sg-button--secondary"
                    onClick={() => setStep("budget")}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                  >
                    Run first analysis
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
