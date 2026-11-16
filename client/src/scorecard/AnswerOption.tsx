export function AnswerOption({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return <button type="button" className={selected ? "scorecard-answer scorecard-answer--selected" : "scorecard-answer"} aria-pressed={selected} onClick={onSelect}><i aria-hidden="true" />{label}</button>;
}
