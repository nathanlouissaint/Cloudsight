import { AnswerOption } from "./AnswerOption";
import type { AnswerId, ScorecardQuestion } from "./questions";

export function QuestionCard({ question, selected, onSelect }: { question: ScorecardQuestion; selected?: AnswerId; onSelect: (answer: AnswerId) => void }) {
  return <section className="scorecard-question" aria-labelledby="scorecard-question-heading"><p className="scorecard-question__category">{question.categoryLabel}</p><h1 id="scorecard-question-heading">{question.prompt}</h1><div className="scorecard-answer-list">{question.options.map((option) => <AnswerOption key={option.id} label={option.label} selected={selected === option.id} onSelect={() => onSelect(option.id)} />)}</div></section>;
}
