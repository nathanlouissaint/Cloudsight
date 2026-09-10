export default function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-container landing-hero__inner">
        <div className="landing-hero__content">
          <p className="landing-eyebrow">
            AWS COST INTELLIGENCE
          </p>

          <h1 className="landing-hero__headline">
            Know your AWS budget risk before the bill arrives.
          </h1>

          <p className="landing-hero__subheadline">
            CloudSight monitors your AWS spending, projects where
            you'll finish the month, and shows which services are
            driving unexpected cost increases.
          </p>

          <div className="landing-hero__actions">
            <a href="#private-beta" className="button button--primary">
              Join Private Beta
            </a>

            <a href="#product" className="button button--secondary">
              See How It Works
            </a>
          </div>

          <p className="landing-hero__trust">
            Read-only AWS access · No long-lived access keys ·
            Disconnect anytime
          </p>
        </div>

        <SpendHeroPreview />
      </div>
    </section>
  );
}

function SpendHeroPreview() {
  return (
    <div className="landing-hero__preview">
      <div className="preview-window">
        <p>CloudSight Spend Guard</p>
      </div>
    </div>
  );
}