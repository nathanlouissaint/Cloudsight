import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect AWS",
    copy:
      "Securely connect your AWS account using read-only permissions. Spend Guard cannot create, modify, or delete infrastructure.",
  },
  {
    number: "02",
    title: "Set your budget",
    copy:
      "Choose the monthly AWS budget you want Spend Guard to monitor against.",
  },
  {
    number: "03",
    title: "We monitor",
    copy:
      "Spend Guard continuously evaluates your cost trajectory, projected spend, and the services driving changes.",
  },
  {
    number: "04",
    title: "Get warned",
    copy:
      "When projected spend puts your budget at risk, Spend Guard surfaces the overage and what is causing it.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="how-it-works__container">
        <motion.div
          className="how-it-works__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="how-it-works__eyebrow">
            HOW IT WORKS
          </p>

          <h2 className="how-it-works__title">
            From AWS connection to early warning in four steps.
          </h2>

          <p className="how-it-works__intro">
            Spend Guard is designed to get from account connection to useful
            budget insight without adding another complicated FinOps workflow.
          </p>
        </motion.div>

        <div className="how-it-works__steps">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="how-it-works__step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
            >
              <div className="how-it-works__rail">
                <span className="how-it-works__number">
                  {step.number}
                </span>

                {index < steps.length - 1 && (
                  <span className="how-it-works__connector" />
                )}
              </div>

              <div className="how-it-works__content">
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="how-it-works__trust"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="how-it-works__trust-dot" />
          Read-only AWS access
          <span className="how-it-works__trust-separator">·</span>
          No long-lived access keys
          <span className="how-it-works__trust-separator">·</span>
          Disconnect anytime
        </motion.div>
      </div>
    </section>
  );
}
