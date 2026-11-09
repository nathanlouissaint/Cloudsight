import { motion } from "framer-motion";

const capabilities = [
  {
    number: "01",
    title: "Monitor",
    copy:
      "Track current AWS spending against the monthly budget your team sets.",
  },
  {
    number: "02",
    title: "Project",
    copy:
      "Estimate where your AWS spend is heading before the billing period closes.",
  },
  {
    number: "03",
    title: "Explain",
    copy:
      "See which AWS services are driving the biggest changes in your monthly spend.",
  },
  {
    number: "04",
    title: "Alert",
    copy:
      "Get warned when your spending trajectory puts the budget at risk.",
  },
];

export default function SolutionSection() {
  return (
    <section className="solution-section" id="solution">
      <div className="solution-section__container">
        <motion.div
          className="solution-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="solution-section__eyebrow">
            THE SOLUTION
          </p>

          <h2 className="solution-section__title">
            See where your AWS bill is heading before it gets there.
          </h2>

          <p className="solution-section__intro">
            Spend Guard gives your team an early warning system for AWS spend — so you can see risk, understand what is driving it, and act before the billing period closes.
          </p>
        </motion.div>

        <div className="solution-section__grid">
          {capabilities.map((capability, index) => (
            <motion.article
              key={capability.number}
              className="solution-section__card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
            >
              <div className="solution-section__card-top">
                <span className="solution-section__number">
                  {capability.number}
                </span>

                <span className="solution-section__line" />
              </div>

              <div className="solution-section__card-content">
                <h3>{capability.title}</h3>
                <p>{capability.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
