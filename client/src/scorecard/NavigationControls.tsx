export function NavigationControls({ onBack, onContinue, canContinue, isFinal }: { onBack: () => void; onContinue: () => void; canContinue: boolean; isFinal: boolean }) {
  return <nav className="scorecard-controls" aria-label="Scorecard navigation"><button type="button" className="scorecard-back" onClick={onBack}>← Back</button><button type="button" className="scorecard-continue" disabled={!canContinue} onClick={onContinue}>{isFinal ? "See my results" : "Continue"} <span aria-hidden="true">↗</span></button></nav>;
}
