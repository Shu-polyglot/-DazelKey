import { DIMENSIONS } from '../data/traits';
import { SCORE_MIN, SCORE_MAX } from './traitQuiz';

/*
  Linear, not saturating -- the Trait Quiz's score for a dimension is
  already bounded (SCORE_MIN-SCORE_MAX, see lib/traitQuiz.js), unlike
  the old vote-count version of this chart, so there's no long tail to
  shape a curve around. A dimension with no score yet (quiz never taken,
  or that dimension left unanswered) simply reads as empty (0%).
*/
export function normalizeScoreToPercent(score) {
  if (!score) {
    return 0;
  }
  return Math.max(0, Math.min(100, ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100));
}

// Every dimension always gets an entry (0 if the quiz has never scored
// it) -- the radar chart draws all 6 axes regardless, same as before.
export function getDimensionScores(traitScores) {
  return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, traitScores?.[dimension] || 0]));
}
