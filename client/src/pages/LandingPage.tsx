import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";

import "../styles/landing/landing.css";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <LandingNavbar />
      <HeroSection />
    </main>
  );
}