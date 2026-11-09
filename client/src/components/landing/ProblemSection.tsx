import { motion } from "framer-motion";

const problems = [
  {
    number: "01",
    title: "Cost spikes compound",
    copy:
      "Small increases across infrastructure can become meaningful overruns before anyone notices.",
  },
  {
    number: "02",
    title: "Visibility arrives late",
    copy:
      "Traditional cost dashboards explain what already happened, rather than where spending is heading.",
  },
  {
    number: "03",
    title: "Manual monitoring does not scale",
    copy:
      "Engineering teams should not have to constantly inspect AWS billing dashboards to stay within budget.",
  },
];

export default function ProblemSection() {
  return (
    <section className="problem-section" id="problem">
      <div className="problem-section__container">
        <motion.div
          className="problem-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="problem-section__eyebrow">
            THE PROBLEM
          </p>

          <h2 className="problem-section__title">
            Your AWS bill shouldn&apos;t be the first warning.
          </h2>

          <p className="problem-section__intro">
            AWS spend changes every day. By the time an overage shows up on
            the bill, the money is already gone.
          </p>
        </motion.div>

        <div className="problem-section__grid">
          {problems.map((problem, index) => (
            <motion.article
              key={problem.number}
              className="problem-section__card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
            >
              <span className="problem-section__number">
                {problem.number}
              </span>

              <div className="problem-section__card-content">
                <h3>{problem.title}</h3>
                <p>{problem.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
