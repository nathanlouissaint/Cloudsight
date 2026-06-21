import AIInsightsPanel from "./AIInsightsPanel";
import AnomalyCenter from "./AnomalyCenter";

export default function IntelligenceRow() {
  return (
    <section className="intelligence-grid">
      <AIInsightsPanel />
      <AnomalyCenter />
    </section>
  );
}