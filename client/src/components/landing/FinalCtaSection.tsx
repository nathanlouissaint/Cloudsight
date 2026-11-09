import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FinalCtaSection() {
  return (
    <section className="final-cta" id="private-beta">
      <div className="final-cta__container">
        <motion.div
          className="final-cta__panel"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div className="final-cta__glow" />

          <div className="final-cta__content">
            <p className="final-cta__eyebrow">
              PRIVATE BETA
            </p>

            <h2 className="final-cta__title">
              Stop finding out after the money is already spent.
            </h2>

            <p className="final-cta__copy">
              See where your AWS bill is heading while there is still time to
              act. Join the Spend Guard private beta and get early access.
            </p>

            <div className="final-cta__actions">
              <Link
                to="/spend-guard/signup"
                className="button button--primary final-cta__button"
              >
                Join Private Beta
              </Link>
            </div>

            <div className="final-cta__trust">
              <span>Read-only AWS access</span>
              <span className="final-cta__separator">·</span>
              <span>No long-lived access keys</span>
              <span className="final-cta__separator">·</span>
              <span>Disconnect anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
