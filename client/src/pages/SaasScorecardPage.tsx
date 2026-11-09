import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NavigationControls } from "../scorecard/NavigationControls";
import { ProgressIndicator } from "../scorecard/ProgressIndicator";
import { QuestionCard } from "../scorecard/QuestionCard";
import { ScorecardLeadForm } from "../scorecard/ScorecardLeadForm";
import { scorecardQuestions, type AnswerId, type ScorecardAnswers } from "../scorecard/questions";
import { calculateScorecard, getRecommendations, isScorecardComplete } from "../scorecard/scoring";
import { ScorecardLayout } from "../scorecard/ScorecardLayout";
import "../styles/scorecard.css";

export default function SaasScorecardPage() {
  const [screen, setScreen] = useState<"intro" | "question" | "results">("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ScorecardAnswers>({});
  const question = scorecardQuestions[index];
  const result = useMemo(() => calculateScorecard(answers), [answers]);
  const categories = scorecardQuestions.filter((item, position) => scorecardQuestions.findIndex((candidate) => candidate.categoryId === item.categoryId) === position);
  const selectAnswer = (answer: AnswerId) => setAnswers((current) => ({ ...current, [question.id]: answer }));
  const goNext = () => { if (index === scorecardQuestions.length - 1) { if (isScorecardComplete(answers)) setScreen("results"); } else setIndex((current) => current + 1); };
  return <ScorecardLayout>
    {screen === "intro" && <section className="scorecard-intro" aria-labelledby="scorecard-intro-heading"><Link className="scorecard-home-link" to="/website-audit">← Back to Website Audit</Link><p className="scorecard-kicker">SAAS WEBSITE SCORECARD</p><h1 id="scorecard-intro-heading">Is your SaaS website costing you signups?</h1><p>Answer 10 questions to see practical areas that may be worth reviewing.</p><button type="button" className="scorecard-start" onClick={() => setScreen("question")}>Start your scorecard <span aria-hidden="true">↗</span></button><small>10 questions <b>·</b> About 2 minutes</small></section>}
    {screen === "question" && <section className="scorecard-flow"><ProgressIndicator current={index + 1} total={scorecardQuestions.length} category={question.categoryLabel} /><QuestionCard question={question} selected={answers[question.id]} onSelect={selectAnswer} /><NavigationControls onBack={() => index === 0 ? setScreen("intro") : setIndex((current) => current - 1)} onContinue={goNext} canContinue={Boolean(answers[question.id])} isFinal={index === scorecardQuestions.length - 1} /></section>}
    {screen === "results" && <section className="scorecard-results" aria-labelledby="scorecard-results-heading"><p className="scorecard-kicker">SELF-ASSESSED WEBSITE READINESS</p><h1 id="scorecard-results-heading">{Math.round(result.totalScore)}<small> / 100</small></h1><p>These results are based on your responses. They are a practical starting point, not an independently verified audit or a prediction of conversion rates.</p><div>{categories.map((category) => <article key={category.categoryId}><span>{category.categoryLabel}</span><b>{result.categoryScores[category.categoryId]} / {result.categoryMaximums[category.categoryId]}</b></article>)}</div><ScorecardLeadForm result={result} recommendations={getRecommendations(answers)} /><button type="button" className="scorecard-back" onClick={() => { setIndex(scorecardQuestions.length - 1); setScreen("question"); }}>← Review answers</button><Link className="scorecard-home-link" to="/website-audit">← Back to Website Audit</Link></section>}
  </ScorecardLayout>;
}
