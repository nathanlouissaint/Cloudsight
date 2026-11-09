import {
  useEffect,
  useRef,
} from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import SpendPreview from "../components/landing/SpendPreview";
import ProblemSection from "../components/landing/ProblemSection";
import SolutionSection from "../components/landing/SolutionSection";
import RiskAlertPreview from "../components/landing/RiskAlertPreview";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import SecuritySection from "../components/landing/SecuritySection";
import AudienceSection from "../components/landing/AudienceSection";
import FinalCtaSection from "../components/landing/FinalCtaSection";
import LandingFooter from "../components/landing/LandingFooter";

import "../styles/landing/landing.css";
import { analytics } from "../lib/analytics";

export default function LandingPage() {
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;

    analytics.track("landing_viewed", {
      page: "landing",
      path: window.location.pathname,
    });
  }, []);

  return (
    <main className="landing-page" id="top">
      <LandingNavbar />
      <HeroSection />
      <SpendPreview />
      <ProblemSection />
      <SolutionSection />
      <RiskAlertPreview />
      <HowItWorksSection />
      <SecuritySection />
      <AudienceSection />
      <FinalCtaSection />
      <LandingFooter />
    </main>
  );
}
