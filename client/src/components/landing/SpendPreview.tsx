export default function SpendPreview() {
  return (
    <section
      className="landing-product-preview"
      id="product"
    >
      <div className="landing-container">
        <div className="landing-hero__preview">
          <div className="spend-preview">
            <div className="spend-preview__header">
              <div>
                <p className="spend-preview__eyebrow">
                  CloudSight Spend Guard
                </p>

                <h2 className="spend-preview__title">
                  AWS Spend Overview
                </h2>
              </div>

              <span className="spend-preview__period">
                September
              </span>
            </div>

            <div className="spend-preview__summary">
              <div className="spend-preview__primary-metric">
                <span className="spend-preview__label">
                  Month-to-date
                </span>

                <strong className="spend-preview__amount">
                  $32,840
                </strong>
              </div>

              <div className="spend-preview__projection">
                <span className="spend-preview__label">
                  Projected month-end
                </span>

                <strong className="spend-preview__projected-amount">
                  $54,720
                </strong>
              </div>
            </div>

            <div className="spend-preview__budget">
              <div className="spend-preview__budget-meta">
                <span>65.7% of budget used</span>
                <span>$50,000 budget</span>
              </div>

              <div className="spend-preview__budget-track">
                <div className="spend-preview__budget-fill" />
              </div>
            </div>

            <div className="spend-preview__metrics">
              <div className="spend-preview__metric">
                <span className="spend-preview__label">
                  Projected overage
                </span>

                <strong>+$4,720</strong>
              </div>

              <div className="spend-preview__metric">
                <span className="spend-preview__label">
                  Budget used
                </span>

                <strong>65.7%</strong>
              </div>

              <div className="spend-preview__metric">
                <span className="spend-preview__label">
                  Risk
                </span>

                <strong className="spend-preview__risk">
                  High
                </strong>
              </div>
            </div>

            <div className="spend-preview__chart">
              <div className="spend-preview__chart-header">
                <span>Spend trajectory</span>
                <span>September</span>
              </div>

              <svg
                viewBox="0 0 640 180"
                role="img"
                aria-label="AWS spend trajectory trending above budget"
                className="spend-preview__chart-svg"
              >
                <line
                  x1="0"
                  y1="128"
                  x2="640"
                  y2="128"
                  className="spend-preview__budget-line"
                />

                <path
                  d="M0 156 C60 153 95 145 135 137 C190 126 212 117 260 112 C310 106 344 91 392 84 C447 76 474 60 520 48 C570 35 602 28 640 18"
                  className="spend-preview__chart-line"
                />
              </svg>
            </div>

            <div className="spend-preview__driver">
              <div>
                <span className="spend-preview__label">
                  Top cost driver
                </span>

                <strong>Amazon EC2</strong>
              </div>

              <div className="spend-preview__driver-change">
                <strong>+$2,184</strong>
                <span>+18.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
