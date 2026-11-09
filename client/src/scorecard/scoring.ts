import { SCORING_VERSION, scorecardQuestions, type ScorecardAnswers, type ScorecardCategoryId } from "./questions";

export interface ScorecardResult { scoringVersion: typeof SCORING_VERSION; totalScore: number; categoryScores: Record<ScorecardCategoryId, number>; categoryMaximums: Record<ScorecardCategoryId, number>; questionScores: Record<string, number>; answerIds: ScorecardAnswers; }
export interface ScorecardRecommendation { questionId: string; title: string; why: string; nextStep: string; service: string; }

export function calculateScorecard(answers: ScorecardAnswers): ScorecardResult {
  const categoryScores = {} as Record<ScorecardCategoryId, number>;
  const categoryMaximums = {} as Record<ScorecardCategoryId, number>;
  const questionScores: Record<string, number> = {};
  let totalScore = 0;
  for (const question of scorecardQuestions) {
    const perQuestionMaximum = question.categoryMaximum / 2;
    categoryMaximums[question.categoryId] = question.categoryMaximum;
    categoryScores[question.categoryId] ??= 0;
    const option = question.options.find((candidate) => candidate.id === answers[question.id]);
    const score = option ? perQuestionMaximum * option.multiplier : 0;
    questionScores[question.id] = score;
    categoryScores[question.categoryId] += score;
    totalScore += score;
  }
  return { scoringVersion: SCORING_VERSION, totalScore, categoryScores, categoryMaximums, questionScores, answerIds: { ...answers } };
}

export function isScorecardComplete(answers: ScorecardAnswers) { return scorecardQuestions.every((question) => question.options.some((option) => option.id === answers[question.id])); }

export function getRecommendations(answers: ScorecardAnswers): ScorecardRecommendation[] {
  return scorecardQuestions.map((question, index) => { const option=question.options.find((item)=>item.id===answers[question.id]); const deficit=(1-(option?.multiplier ?? 0))*(question.categoryMaximum/2); return { index, deficit, recommendation:{ questionId:question.id, title:`Strengthen ${question.categoryLabel}`, why:`Your answer indicates this part of the buyer journey has room to become clearer and easier to evaluate.`, nextStep:`Review the page content and path to action for ${question.prompt.toLowerCase()}`, service:question.categoryId==="messaging-clarity"?"Messaging and positioning":question.categoryId==="conversion-experience"?"Conversion optimization":"Website audit" } }; }).filter((item)=>item.deficit>0).sort((a,b)=>b.deficit-a.deficit||a.index-b.index).slice(0,3).map((item)=>item.recommendation);
}
