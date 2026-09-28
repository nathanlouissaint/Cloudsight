import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../../styles/spend-guard/funnel.css";

import {
  getSpendGuardAwsConnection,
  getSpendGuardBudgetSummary,
  saveSpendGuardBudget,
  runSpendGuardAnalysis,
  verifyAwsConnection,
} from "../../spend-guard/spend-guard.api";

import { analytics } from "../../lib/analytics";

type SetupStep = "aws" | "budget" | "analysis";

export default function SpendGuardSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>("aws");
  const [roleArn, setRoleArn] = useState("");
  const [budget, setBudget] = useState("");
  const [awsAccountId, setAwsAccountId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadAwsConnection() {
      try {
        const connection =
          await getSpendGuardAwsConnection();

        if (
          !cancelled &&
          connection.configured
        ) {
          setAwsAccountId(
            connection.accountId ?? "",
          );

          setRoleArn(
            connection.roleArn ?? "",
          );
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your AWS connection.";

        setVerificationError(message);
      }
    }

    void loadAwsConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBudget() {
      try {
        const summary =
          await getSpendGuardBudgetSummary();

        if (
          !cancelled &&
          summary.configured
        ) {
          setBudget(
            String(summary.budget),
          );
        }
      } catch (error: unknown) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to load your saved budget.";

        setBudgetError(message);
      }
    }

    void loadBudget();

    return () => {
      cancelled = true;
    };
  }, []);

  const stepNumber =
    step === "aws"
      ? 1
      : step === "budget"
        ? 2
        : 3;

  async function handleVerifyAwsConnection() {
    const normalizedRoleArn = roleArn.trim();

    if (!normalizedRoleArn) {
      return;
    }

    analytics.track("aws_connection_started", {
      page: "spend_guard_setup",
      path: window.location.pathname,
      source: "spend_guard",
    });

    setIsVerifying(true);
    setVerificationError("");

    try {
      const connection =
        await verifyAwsConnection(
          normalizedRoleArn,
        );

      setAwsAccountId(
        connection.accountId,
      );

      setRoleArn(
        connection.roleArn,
      );

      analytics.track("mock_aws_account_verified", {
        page: "spend_guard_setup",
        path: window.location.pathname,
        source: "spend_guard",
      });

      setStep("budget");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify AWS connection.";

      setVerificationError(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSaveBudget() {
    const numericBudget =
      Number(budget);

    if (
      !Number.isFinite(numericBudget) ||
      numericBudget <= 0
    ) {
      setBudgetError(
        "Enter a monthly budget greater than zero.",
      );
      return;
    }

    setIsSavingBudget(true);
    setBudgetError("");

    try {
      const savedBudget =
        await saveSpendGuardBudget(
          numericBudget,
        );

      setBudget(
        String(savedBudget.amount),
      );

      analytics.track("budget_created", {
        page: "spend_guard_setup",
        path: window.location.pathname,
        source: "spend_guard",
      });

      setStep("analysis");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your budget.";

      setBudgetError(message);
    } finally {
      setIsSavingBudget(false);
    }
  }

  async function handleRunAnalysis() {
    setIsRunningAnalysis(true);
    setAnalysisError("");

    try {
      await runSpendGuardAnalysis();
      navigate("/spend-guard/results");
    } catch (error: unknown) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Unable to run your first analysis.",
      );
    } finally {
      setIsRunningAnalysis(false);
    }
  }

  return (
    <main className="sg-onboarding">
      <div className="sg-onboarding__shell">
        <header className="sg-onboarding__topbar">
          <Link
            to="/spend-guard"
            className="sg-onboarding__brand"
          >
            <span className="sg-onboarding__brand-mark">C</span>
            <span>CloudSight</span>
          </Link>

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

                {verificationError && (
                  <div
                    className="sg-onboarding__error"
                    role="alert"
                  >
                    {verificationError}
                  </div>
                )}

                <div className="sg-onboarding__actions">
                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                    disabled={
                      !roleArn.trim() ||
                      isVerifying
                    }
                    onClick={
                      handleVerifyAwsConnection
                    }
                  >
                    {isVerifying
                      ? "Verifying..."
                      : "Verify connection"}
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
                      disabled={isSavingBudget}
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

                {budgetError && (
                  <div
                    className="sg-onboarding__error"
                    role="alert"
                  >
                    {budgetError}
                  </div>
                )}

                <div className="sg-onboarding__actions">
                  <button
                    type="button"
                    className="sg-button sg-button--secondary"
                    disabled={isSavingBudget}
                    onClick={() => setStep("aws")}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                    disabled={
                      !budget.trim() ||
                      isSavingBudget
                    }
                    onClick={handleSaveBudget}
                  >
                    {isSavingBudget
                      ? "Saving..."
                      : "Continue"}
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
                    <span>AWS account</span>
                    <strong>{awsAccountId}</strong>
                  </div>

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

                  {analysisError && (
                    <div
                      className="sg-onboarding__error"
                      role="alert"
                    >
                      {analysisError}
                    </div>
                  )}

                  <button
                    type="button"
                    className="sg-button sg-button--primary"
                    disabled={isRunningAnalysis}
                    onClick={handleRunAnalysis}
                  >
                    {isRunningAnalysis
                      ? "Analyzing..."
                      : "Run first analysis"}
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
