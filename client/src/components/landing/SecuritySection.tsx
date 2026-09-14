import { motion } from "framer-motion";

const safeguards = [
  {
    number: "01",
    title: "Read-only access",
    copy:
      "Spend Guard only needs permission to read the billing and cost data required to analyze your AWS spend.",
  },
  {
    number: "02",
    title: "Temporary credentials",
    copy:
      "Access is performed through an IAM role using temporary AWS credentials instead of long-lived access keys.",
  },
  {
    number: "03",
    title: "No infrastructure control",
    copy:
      "Spend Guard cannot create, modify, restart, or delete your AWS infrastructure.",
  },
  {
    number: "04",
    title: "You stay in control",
    copy:
      "Your team controls the IAM role and can revoke the connection from AWS whenever access is no longer needed.",
  },
];

export default function SecuritySection() {
  return (
    <section className="security-section" id="security">
      <div className="security-section__container">
        <motion.div
          className="security-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="security-section__eyebrow">
            SECURITY
          </p>

          <h2 className="security-section__title">
            Visibility into your costs. Not control over your infrastructure.
          </h2>

          <p className="security-section__intro">
            Spend Guard is designed around limited AWS access. It uses an IAM
            role to retrieve the cost information required for monitoring
            without giving CloudSight administrative control of your account.
          </p>
        </motion.div>

        <motion.div
          className="security-section__panel"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="security-section__architecture">
            <div className="security-section__architecture-label">
              AWS CONNECTION
            </div>

            <div className="security-flow">
              <div className="security-flow__node">
                <span>AWS Account</span>
              </div>

              <div className="security-flow__connection">
                <span className="security-flow__line" />
                <span className="security-flow__tag">
                  IAM ROLE
                </span>
              </div>

              <div className="security-flow__node security-flow__node--active">
                <span>Spend Guard</span>
              </div>
            </div>

            <div className="security-flow__permissions">
              <span className="security-flow__status" />
              Temporary credentials · limited permissions
            </div>
          </div>

          <div className="security-section__safeguards">
            {safeguards.map((safeguard) => (
              <div
                key={safeguard.number}
                className="security-section__safeguard"
              >
                <span className="security-section__number">
                  {safeguard.number}
                </span>

                <div>
                  <h3>{safeguard.title}</h3>
                  <p>{safeguard.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
