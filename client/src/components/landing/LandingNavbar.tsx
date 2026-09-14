import { useEffect, useState } from "react";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={
        scrolled
          ? "landing-navbar landing-navbar--scrolled"
          : "landing-navbar"
      }
    >
      <div className="landing-container landing-navbar__inner">
        <a
          href="#top"
          className="landing-navbar__brand"
          aria-label="CloudSight Spend Guard"
        >
          <span className="landing-navbar__brand-mark">
            C
          </span>

          <span className="landing-navbar__brand-text">
            CloudSight
          </span>
        </a>

        <nav
          className="landing-navbar__links"
          aria-label="Landing page navigation"
        >
          <a href="#problem">Problem</a>
          <a href="#solution">Solution</a>
          <a href="#how-it-works">How it works</a>
          <a href="#security">Security</a>
        </nav>

        <a
          href="#private-beta"
          className="button button--primary landing-navbar__cta"
        >
          Join Private Beta
        </a>
      </div>
    </header>
  );
}
