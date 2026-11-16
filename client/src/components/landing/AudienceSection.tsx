import { motion } from "framer-motion";

const audiences = [
  {
    number: "01",
    role: "Engineering Leaders",
    outcome:
      "Know when infrastructure spending is drifting before finance asks why.",
    detail:
      "Give engineering leadership a clear view of budget risk without requiring constant billing review.",
  },
  {
    number: "02",
    role: "DevOps & Platform",
    outcome:
      "See which AWS services are changing your monthly spend trajectory.",
    detail:
      "Catch cost movement early and understand where the increase is coming from before it compounds.",
  },
  {
    number: "03",
    role: "Technical Founders",
    outcome:
      "Stay ahead of AWS costs without building a dedicated FinOps operation.",
    detail:
      "Get proactive spend visibility while your team stays focused on shipping product and infrastructure.",
  },
];

export default function AudienceSection() {
  return (
    <section className="audience-section" id="audience">
      <div className="audience-section__container">
        <motion.div
          className="audience-section__header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
        >
          <p className="audience-section__eyebrow">
            BUILT FOR
          </p>

          <h2 className="audience-section__title">
            For teams running AWS without wanting to watch the bill every day.
          </h2>

          <p className="audience-section__intro">
            Spend Guard is designed for technical teams that own cloud
            infrastructure and need earlier visibility into where AWS spending
            is heading.
          </p>
        </motion.div>

        <div className="audience-section__grid">
          {audiences.map((audience, index) => (
            <motion.article
              key={audience.number}
              className="audience-section__card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
            >
              <div className="audience-section__card-top">
                <span className="audience-section__number">
                  {audience.number}
                </span>

                <span className="audience-section__role">
                  {audience.role}
                </span>
              </div>

              <div className="audience-section__card-content">
                <h3>{audience.outcome}</h3>
                <p>{audience.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
