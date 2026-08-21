import { DIMENSIONS } from '../data/traits';
import { QUIZ_QUESTIONS, QUIZ_SCALE, TOP_DIMENSIONS_COUNT } from '../data/traitQuiz';

// 3 questions per dimension, each scored on QUIZ_SCALE -- the bounds
// every dimension's score falls within, regardless of question count
// (used to normalize a raw score onto the radar chart's 0-100% axis).
const QUESTIONS_PER_DIMENSION = QUIZ_QUESTIONS.length / DIMENSIONS.length;
export const SCORE_MIN = QUESTIONS_PER_DIMENSION * QUIZ_SCALE[0].value;
export const SCORE_MAX = QUESTIONS_PER_DIMENSION * QUIZ_SCALE[QUIZ_SCALE.length - 1].value;

/*
  `answers` is a plain { [questionIndex]: 1-5 } map. Each dimension's
  score is the sum of its 3 questions (range 3-15) -- ungraded on a
  curve, so a dimension only left partially answered scores low rather
  than throwing, which keeps the quiz safe to score at any point.
*/
export function scoreQuiz(answers) {
  const scores = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));

  QUIZ_QUESTIONS.forEach((question, index) => {
    scores[question.dimension] += answers[index] || 0;
  });

  return scores;
}

// Highest-scoring dimensions first; ties keep DIMENSIONS' own order so
// the result is stable rather than depending on sort implementation.
export function getTopDimensions(scores, count = TOP_DIMENSIONS_COUNT) {
  return DIMENSIONS.slice()
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, count);
}
