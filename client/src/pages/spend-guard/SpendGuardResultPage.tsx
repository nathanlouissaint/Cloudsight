import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import "../../styles/spend-guard/funnel.css";

import {
  getSpendGuardAnalysis,
} from "../../spend-guard/spend-guard.api";

import type {
  SpendGuardAnalysis,
} from "../../spend-guard/spend-guard.api";

import { analytics } from "../../lib/analytics";

function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatPercent(
  value: number,
) {
  return `${value.toFixed(1)}%`;
}

function getRiskLabel(
  level: SpendGuardAnalysis["risk"]["level"],
) {
  switch (level) {
    case "LOW":
      return "Low risk";

    case "MEDIUM":
      return "Medium risk";

    case "HIGH":
      return "High risk";

    case "CRITICAL":
      return "Critical risk";
  }
}

export default function SpendGuardResultPage() {
  const navigate =
    useNavigate();

  const hasTrackedAnalysisView = useRef(false);

  const [
    analysis,
    setAnalysis,
  ] = useState<SpendGuardAnalysis | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  async function loadAnalysis() {
    setIsLoading(true);
    setError("");

    try {
      const result =
        await getSpendGuardAnalysis();

      setAnalysis(result);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your Spend Guard analysis.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialAnalysis() {
      try {
        const result =
          await getSpendGuardAnalysis();

        if (!cancelled) {
          setAnalysis(result);

          if (!hasTrackedAnalysisView.current) {
            hasTrackedAnalysisView.current = true;

            analytics.track("analysis_viewed", {
              page: "spend_guard_results",
              path: window.location.pathname,
              source: "spend_guard",
            });
          }
        }
      } catch (loadError: unknown) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your Spend Guard analysis.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="sg-onboarding">
        <div className="sg-onboarding__shell">
          <header className="sg-onboarding__topbar">
            <Link
              to="/spend-guard"
              className="sg-onboarding__brand"
            >
              <span className="sg-onboarding__brand-mark">
                C
              </span>

              <span>
                CloudSight
              </span>
            </Link>

            <span className="sg-onboarding__product">
              Spend Guard
            </span>
          </header>

          <section className="sg-result">
            <div className="sg-result__loading">
              <p className="sg-onboarding__eyebrow">
                SPEND GUARD
              </p>

              <h1>
                Loading your analysis...
              </h1>

              <p>
                Reading your latest AWS cost
                snapshots and budget.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (
    error ||
    !analysis
  ) {
    return (
      <main className="sg-onboarding">
        <div className="sg-onboarding__shell">
          <header className="sg-onboarding__topbar">
            <Link
              to="/spend-guard"
              className="sg-onboarding__brand"
            >
              <span className="sg-onboarding__brand-mark">
                C
              </span>

              <span>
                CloudSight
              </span>
            </Link>

            <span className="sg-onboarding__product">
              Spend Guard
            </span>
          </header>

          <section className="sg-result">
            <div className="sg-result__error">
              <p className="sg-onboarding__eyebrow">
                ANALYSIS UNAVAILABLE
              </p>

              <h1>
                We couldn't load your analysis.
              </h1>

              <p>
                {error ||
                  "Your Spend Guard analysis is not available yet."}
              </p>

              <div className="sg-onboarding__actions">
                <button
                  type="button"
                  className="sg-button sg-button--secondary"
                  onClick={() => {
                    navigate(
                      "/spend-guard/setup",
                    );
                  }}
                >
                  Back to setup
                </button>

                <button
                  type="button"
                  className="sg-button sg-button--primary"
                  onClick={() => {
                    void loadAnalysis();
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const isOverBudget =
    analysis.projection.projectedOverage > 0;

  return (
    <main className="sg-onboarding">
      <div className="sg-onboarding__shell">
        <header className="sg-onboarding__topbar">
          <Link
            to="/spend-guard"
            className="sg-onboarding__brand"
          >
            <span className="sg-onboarding__brand-mark">
              C
            </span>

            <span>
              CloudSight
            </span>
          </Link>

          <span className="sg-onboarding__product">
            Spend Guard
          </span>
        </header>

        <section className="sg-result">
          <div className="sg-result__header">
            <div>
              <p className="sg-onboarding__eyebrow">
                FIRST ANALYSIS
              </p>

              <h1>
                Your AWS spend outlook.
              </h1>

              <p className="sg-result__subtitle">
                {analysis.account.accountName}
                {" · "}
                {analysis.account.accountId}
              </p>
            </div>

            <div
              className={
                `sg-result__risk sg-result__risk--${analysis.risk.level.toLowerCase()}`
              }
            >
              <span>
                Risk level
              </span>

              <strong>
                {getRiskLabel(
                  analysis.risk.level,
                )}
              </strong>
            </div>
          </div>

          <div className="sg-result__hero-grid">
            <article className="sg-result__metric sg-result__metric--primary">
              <span>
                Projected month-end spend
              </span>

              <strong>
                {formatCurrency(
                  analysis.projection
                    .projectedSpend,
                )}
              </strong>

              <p>
                {analysis.risk.reason}
              </p>
            </article>

            <article className="sg-result__metric">
              <span>
                Monthly budget
              </span>

              <strong>
                {formatCurrency(
                  analysis.budget
                    .monthlyBudget,
                )}
              </strong>
            </article>

            <article className="sg-result__metric">
              <span>
                {isOverBudget
                  ? "Projected overage"
                  : "Projected remaining"}
              </span>

              <strong>
                {formatCurrency(
                  isOverBudget
                    ? analysis.projection
                        .projectedOverage
                    : analysis.projection
                        .projectedRemaining,
                )}
              </strong>
            </article>

            <article className="sg-result__metric">
              <span>
                Observed spend
              </span>

              <strong>
                {formatCurrency(
                  analysis.spend
                    .currentSpend,
                )}
              </strong>
            </article>
          </div>

          <div className="sg-result__content-grid">
            <article className="sg-result__panel">
              <div className="sg-result__panel-header">
                <div>
                  <p className="sg-onboarding__eyebrow">
                    COST DRIVERS
                  </p>

                  <h2>
                    Where the money is going
                  </h2>
                </div>

                <span>
                  Top services
                </span>
              </div>

              {analysis.topDrivers.length > 0 ? (
                <div className="sg-result__drivers">
                  {analysis.topDrivers.map(
                    (
                      driver,
                      index,
                    ) => (
                      <div
                        className="sg-result__driver"
                        key={
                          driver.serviceName
                        }
                      >
                        <span className="sg-result__driver-rank">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        <div className="sg-result__driver-main">
                          <strong>
                            {
                              driver.serviceName
                            }
                          </strong>

                          <span>
                            {formatPercent(
                              driver.percentOfSpend,
                            )}{" "}
                            of observed
                            service spend
                          </span>
                        </div>

                        <strong className="sg-result__driver-cost">
                          {formatCurrency(
                            driver.currentSpend,
                          )}
                        </strong>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="sg-result__empty">
                  No service-level cost
                  drivers are available yet.
                </p>
              )}
            </article>

            <article className="sg-result__panel sg-result__panel--insight">
              <p className="sg-onboarding__eyebrow">
                PRIMARY INSIGHT
              </p>

              <h2>
                What needs your attention
              </h2>

              <p className="sg-result__insight">
                {analysis.insight}
              </p>

              <div className="sg-result__projection-details">
                <div>
                  <span>
                    Budget utilization
                  </span>

                  <strong>
                    {formatPercent(
                      analysis.projection
                        .budgetUtilizationPercent,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Average daily spend
                  </span>

                  <strong>
                    {formatCurrency(
                      analysis.spend
                        .averageDailySpend,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Observed days
                  </span>

                  <strong>
                    {
                      analysis.spend
                        .observedDays
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Projection method
                  </span>

                  <strong>
                    Run-rate
                  </strong>
                </div>
              </div>
            </article>
          </div>

          <div className="sg-result__footer">
            <div>
              <span>
                Analysis generated
              </span>

              <strong>
                {new Date(
                  analysis.analysisDate,
                ).toLocaleString()}
              </strong>
            </div>

            <Link
              to="/spend-guard/setup"
              className="sg-button sg-button--secondary"
            >
              Back to setup
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
