import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <header className="landing-nav">
      <div className="landing-container landing-nav__inner">
        <a href="/" className="landing-nav__brand">
          CloudSight
        </a>

        <nav className="landing-nav__links" aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#security">Security</a>
        </nav>

        <div className="landing-nav__actions">
          <Link to="/login" className="landing-nav__login">
            Sign In
          </Link>

          <a href="#private-beta" className="button button--primary">
            Join Private Beta
          </a>
        </div>
      </div>
    </header>
  );
}