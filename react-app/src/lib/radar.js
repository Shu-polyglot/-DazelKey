import { DIMENSIONS, getDimensionForTrait } from '../data/traits';

// How many votes it takes to fill a radar axis halfway -- lower K means
// an axis visibly grows sooner but flattens out sooner too. Tune this
// one constant to make the whole chart feel faster or slower to fill.
export const RADAR_SATURATION_K = 75;

// Saturating curve, not a linear one: early votes move the axis a
// visible amount, further votes always add *something* but never let
// the axis actually finish -- same "long tail, never complete" shape as
// the rest of Strategy.
export function normalizeToPercent(totalVotes) {
  return 100 * (1 - Math.exp(-totalVotes / RADAR_SATURATION_K));
}

// Every dimension always gets an entry (0 if nothing's active there
// yet) -- the radar chart draws all 6 axes regardless, so an empty
// dimension reads as "not started" rather than disappearing.
export function getDimensionVoteTotals(buckets, votes) {
  const totals = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));

  buckets
    .filter((bucket) => bucket.goalType === 'become')
    .forEach((bucket) => {
      const dimension = getDimensionForTrait(bucket.title);
      if (!dimension) {
        return;
      }
      const count = votes.filter((vote) => vote.goalId === bucket.id).length;
      totals[dimension] += count;
    });

  return totals;
}
