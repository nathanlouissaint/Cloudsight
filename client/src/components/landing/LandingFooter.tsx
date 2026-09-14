export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__container">
        <div className="landing-footer__top">
          <a
            href="#top"
            className="landing-footer__brand"
          >
            CloudSight
            <span>Spend Guard</span>
          </a>

          <nav
            className="landing-footer__nav"
            aria-label="Footer navigation"
          >
            <a href="#problem">Problem</a>
            <a href="#solution">Solution</a>
            <a href="#how-it-works">How it works</a>
            <a href="#security">Security</a>
            <a href="#audience">Built for</a>
          </nav>
        </div>

        <div className="landing-footer__bottom">
          <span>© 2026 CloudSight</span>

          <div className="landing-footer__meta">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
