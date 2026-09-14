import { motion } from "framer-motion";

const drivers = [
  { name: "Amazon EC2", change: "+18.7%", amount: "+$2,184" },
  { name: "Amazon RDS", change: "+11.2%", amount: "+$1,426" },
  { name: "Amazon S3", change: "+4.8%", amount: "+$612" },
];

export default function RiskAlertPreview() {
  return (
    <section className="risk-preview-section" id="risk-preview">
      <div className="risk-preview-section__container">
        <motion.div
          className="risk-preview-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="risk-preview-section__eyebrow">
            EARLY WARNING
          </p>

          <h2 className="risk-preview-section__title">
            Know when the budget is at risk while there is still time to act.
          </h2>

          <p className="risk-preview-section__intro">
            Spend Guard monitors your trajectory and surfaces the projected
            overage, risk level, and services driving the increase.
          </p>
        </motion.div>

        <motion.div
          className="risk-preview"
          initial={{ opacity: 0, y: 30, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
        >
          <div className="risk-preview__topbar">
            <div>
              <span className="risk-preview__product">
                CLOUDSIGHT SPEND GUARD
              </span>

              <h3>Budget risk detected</h3>
            </div>

            <span className="risk-preview__badge">
              HIGH RISK
            </span>
          </div>

          <div className="risk-preview__summary">
            <div className="risk-preview__primary">
              <span>Projected overage</span>
              <strong>+$4,720</strong>
              <p>
                At the current trajectory, this AWS account is projected to
                exceed its September budget.
              </p>
            </div>

            <div className="risk-preview__metrics">
              <div className="risk-preview__metric">
                <span>Projected month-end</span>
                <strong>$54,720</strong>
              </div>

              <div className="risk-preview__metric">
                <span>Monthly budget</span>
                <strong>$50,000</strong>
              </div>

              <div className="risk-preview__metric">
                <span>Budget variance</span>
                <strong className="risk-preview__danger">
                  +9.4%
                </strong>
              </div>
            </div>
          </div>

          <div className="risk-preview__divider" />

          <div className="risk-preview__drivers">
            <div className="risk-preview__drivers-header">
              <div>
                <span className="risk-preview__section-label">
                  WHAT'S DRIVING THE RISK
                </span>
                <h4>Largest cost increases</h4>
              </div>

              <span className="risk-preview__period">
                September
              </span>
            </div>

            <div className="risk-preview__driver-list">
              {drivers.map((driver) => (
                <div
                  key={driver.name}
                  className="risk-preview__driver"
                >
                  <div>
                    <strong>{driver.name}</strong>
                    <span>{driver.change} vs previous period</span>
                  </div>

                  <strong>{driver.amount}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="risk-preview__footer">
            <span className="risk-preview__pulse" />
            Spend trajectory remains above the configured monthly budget.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
