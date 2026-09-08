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

const TIME_LABEL_FORMAT = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const WEEKDAY_LABEL_FORMAT = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

// Turns the soonest entry from getFreeEveningsThisWeek (lib/googleCalendar)
// into the one-line "today 18:00–21:00" WeeklyNudgeCard shows instead of
// its generic "this week" copy once a real free evening is known --
// see that note's own Human Agency example ("今日18:00〜21:00なら近場で
// 行けそう") for why this stays a specific, offered slot rather than a
// vaguer nudge. Returns null when there's nothing to describe (no
// Google Calendar connection, or no free evening this week).
export function describeFreeEvening(freeEvening) {
  if (!freeEvening) {
    return null;
  }
  const dayLabel =
    freeEvening.dayIndex === 0 ? 'Today' : freeEvening.dayIndex === 1 ? 'Tomorrow' : WEEKDAY_LABEL_FORMAT.format(freeEvening.date);
  return `${dayLabel} ${TIME_LABEL_FORMAT.format(freeEvening.windowStart)}–${TIME_LABEL_FORMAT.format(freeEvening.windowEnd)}`;
}
