import { todayIso } from './dates';

export const STORAGE_KEY = 'dazelkey-buckets-v2';

/*
  A Bucket is a future intention, not a scheduled task. There is
  deliberately no planning-time date — `when` is a horizon, not a
  calendar entry. The only concrete date anywhere in this model is
  `completedDate`, which only ever exists once the experience actually
  happened.
*/
export const whenOptions = ['thisYear', 'beforeIDie'];

// Soon and Long term were folded into these two once they turned out to
// be a distinction without a difference in practice -- see
// migrateWhen below for how an item saved under one of those old values
// lands here. 'thisYear' has no fixed label of its own -- see
// getWhenLabel, the only way any caller should read a `when` label.
const STATIC_WHEN_LABELS = {
  beforeIDie: 'Lifetime',
};

// Resolves a `when` value to what a tab/badge should actually show.
// `thisYear` is deliberately not a static label above -- computing it
// fresh on every call is what makes the displayed year self-update
// across a New Year's without touching stored data.
export function getWhenLabel(when) {
  if (when === 'thisYear') {
    return String(new Date().getFullYear());
  }
  return STATIC_WHEN_LABELS[when] || '';
}

// Maps a bucket's stored `when` from the retired 4-category scheme onto
// today's 2 -- Soon collapses into This year (both meant "not far off"),
// Long term collapses into Before I die (both meant "no real deadline").
// Applied by normalizeBucket on every read (see safeWhen below), not as
// a one-time rewrite of stored data -- same non-destructive pattern this
// file already uses for other retired fields.
const WHEN_MIGRATION = { soon: 'thisYear', longTerm: 'beforeIDie' };

function migrateWhen(when) {
  return WHEN_MIGRATION[when] || when;
}

export const modeOptions = ['solo', 'together'];

export const modeLabels = {
  solo: 'Solo',
  together: 'Together',
};

/*
  Every Bucket is something to Have -- an experience, a possession. Top 3
  Priority (identity goals, tracked by daily votes) lives entirely in its
  own store now (see src/features/topPriority) and is never saved as a
  Bucket at all, so there's no goalType beyond 'have' left here. Kept as
  a field (rather than removed outright) purely so a bucket saved by an
  older build of this app -- which may still say 'become' -- normalizes
  down to 'have' safely instead of crashing.
*/
export const goalTypeOptions = ['have'];

export const goalTypeLabels = {
  have: 'Have',
};

// How many Realize goals can be tracked at once -- enforced both in the
// UI (StrategyPage disables "+ Add a Goal" at the cap) and as a safety
// net in App.jsx's handlers.
export const MAX_DOING_GOALS = 5;

// No seed data -- a fresh install starts with an empty Bucket List
// (see useBuckets, which only falls back to this when nothing's been
// migrated or saved yet).
export const defaultBuckets = [];

// A Plan item is one row of a Bucket's own itinerary -- a 24h "HH:MM"
// clock time plus free-text ("10:00", "Meet at the station"). Entirely
// separate from Top Priority's Records Timeline (features/topPriority) --
// same "list of timestamped entries" shape in spirit, but a different
// store, keyed to a different kind of thing (a Bucket's own plan for the
// day, not a logged-after-the-fact Action).
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function normalizePlanItem(item, index) {
  return {
    id: item.id || `plan-${Date.now()}-${index}`,
    time: TIME_PATTERN.test(item.time) ? item.time : '09:00',
    text: item.text || '',
  };
}

// Chronological, earliest first -- "HH:MM" zero-padded strings sort
// correctly as plain text, no date-parsing needed.
export function sortPlanItems(items) {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
}

// "14:05" -> "2:05 PM" -- every other time-of-day this app shows a person
// (none, until Plan) should read in the same 12-hour form as its dates
// already do (see lib/dates' 'en-US' formatting), even though the stored
// value stays 24h for simple string sorting above.
export function formatPlanTime(time) {
  if (!TIME_PATTERN.test(time)) {
    return time;
  }
  const [hourStr, minute] = time.split(':');
  const hour24 = Number(hourStr);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

export function normalizeBucket(bucket, index) {
  const safeStatus = bucket.status === 'completed' ? 'completed' : 'planned';
  const safeMode = modeOptions.includes(bucket.mode) ? bucket.mode : 'solo';
  const migratedWhen = migrateWhen(bucket.when);
  const safeWhen = whenOptions.includes(migratedWhen) ? migratedWhen : 'beforeIDie';
  const safeGoalType = goalTypeOptions.includes(bucket.goalType) ? bucket.goalType : 'have';

  return {
    id: bucket.id || index + 1,
    title: bucket.title || 'Untitled intention',
    mode: safeMode,
    when: safeWhen,
    place: bucket.place || '',
    message: bucket.message || '',
    status: safeStatus,
    completedDate: bucket.completedDate || null,
    image: bucket.image || null,
    goalType: safeGoalType,
    // Strategy's vote grid windows from this date -- Buckets saved before
    // this field existed have no real record of when they started, so
    // "today" (i.e. "we start counting now") is the only honest fallback.
    createdAt: bucket.createdAt || todayIso(),

    // Doing (Have Buckets tracked on Strategy's money-progress side) --
    // only ever set once a Have Bucket goes through "+ Add a Goal", never
    // by default. `doingUnitHistory` is `[{ amount, effectiveFrom }]`,
    // oldest first -- see lib/doing.js for why a raised/lowered unit is
    // appended rather than overwritten. `doingCompletedAt` is set once,
    // the first time progress reaches the goal amount, purely so the
    // completion ritual never fires a second time for the same goal.
    doingEnabled: safeGoalType === 'have' && Boolean(bucket.doingEnabled),
    doingGoalAmount: safeGoalType === 'have' && Number(bucket.doingGoalAmount) > 0 ? Number(bucket.doingGoalAmount) : 0,
    doingUnitHistory:
      safeGoalType === 'have' && Array.isArray(bucket.doingUnitHistory)
        ? bucket.doingUnitHistory.filter((entry) => entry && Number(entry.amount) > 0 && entry.effectiveFrom)
        : [],
    doingChecklist:
      safeGoalType === 'have' && Array.isArray(bucket.doingChecklist)
        ? bucket.doingChecklist
            .filter((item) => item && item.id && item.label)
            .map((item) => ({ id: item.id, label: item.label, isMilestone: Boolean(item.isMilestone), done: Boolean(item.done) }))
        : [],
    doingCompletedAt: safeGoalType === 'have' ? bucket.doingCompletedAt || null : null,

    // Provenance for standalone Achievement entries created by
    // useBuckets' addAchievement (see its own comment) -- lets the
    // Doing history screen pick out exactly the "goal reached" entries
    // this flow creates, and trace each one back to the Doing goal it
    // came from (which is never deleted, just hidden once completed).
    source: bucket.source || null,
    sourceType: bucket.sourceType || null,
    sourceGoalId: bucket.sourceGoalId || null,

    // See normalizePlanItem's own comment above -- this Bucket's own
    // itinerary, edited from ExpandedBucketCard's Plan button.
    planItems: Array.isArray(bucket.planItems)
      ? sortPlanItems(bucket.planItems.map((item, itemIndex) => normalizePlanItem(item, itemIndex)))
      : [],
  };
}

export function getStatusLabel(bucket) {
  return bucket.status === 'completed' ? 'Completed' : 'Planned';
}
