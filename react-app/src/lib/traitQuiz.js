import { DIMENSIONS } from '../data/traits';
import { QUIZ_QUESTIONS, TOP_DIMENSIONS_COUNT } from '../data/traitQuiz';

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
