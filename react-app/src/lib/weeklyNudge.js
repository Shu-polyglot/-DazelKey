/*
  Weekly Nudge -- the one proactive suggestion Strategy makes on its own
  ("this week, could you make time for this?") instead of only reacting
  when a Bucket is opened. Selection logic lives here as pure functions
  (see useWeeklyNudge for the localStorage-backed state that calls
  these) so it can be reasoned about and tested independently of the
  hook's persistence/effect plumbing.
*/

// Same "open, Have Buckets only" filter BucketListPanel's own openBuckets
// uses -- a completed or Become Bucket has nothing left to nudge toward.
export function getNudgeCandidates(buckets) {
  return buckets.filter((bucket) => bucket.status !== 'completed' && bucket.goalType !== 'become');
}

// Picks one candidate to surface this week. Prefers a Bucket that has
// never been suggested before (so the nudge works its way through the
// whole list over time rather than fixating), and among those prefers
// `thisYear` ones since they're the more time-pressured horizon. Once
// every candidate has been suggested at least once, falls back to a
// random pick among whatever's left after `excludeIds` (this week's own
// dismissals) -- returns just the id, or null if nothing's left to
// suggest at all.
export function pickNudgeCandidate(candidates, { suggestedIds = [], excludeIds = [] } = {}) {
  const eligible = candidates.filter((bucket) => !excludeIds.includes(bucket.id));
  if (eligible.length === 0) {
    return null;
  }

  const neverSuggested = eligible.filter((bucket) => !suggestedIds.includes(bucket.id));
  const pool = neverSuggested.length > 0 ? neverSuggested : eligible;

  const thisYearFirst = pool.filter((bucket) => bucket.when === 'thisYear');
  const finalPool = thisYearFirst.length > 0 ? thisYearFirst : pool;

  const pick = finalPool[Math.floor(Math.random() * finalPool.length)];
  return pick.id;
}
