import { todayIso } from './dates';

export const STORAGE_KEY = 'life-os-buckets-v2';

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
  beforeIDie: 'Before I die',
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

export const defaultBuckets = [
  {
    id: 1,
    title: 'See the Northern Lights',
    mode: 'together',
    when: 'beforeIDie',
    place: 'Iceland',
    message: 'One of the most unreal nights of my life.',
    status: 'completed',
    completedDate: '2027-03-15',
    image: null,
  },
  {
    id: 2,
    title: 'Build my first web app',
    mode: 'solo',
    when: 'thisYear',
    place: 'Remote',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 3,
    title: 'Visit New York',
    mode: 'together',
    when: 'beforeIDie',
    place: 'New York',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
    // Fictional demo Doing goal, same spirit as the Focused seed below --
    // far enough back that the grid has real weeks to show.
    doingEnabled: true,
    doingGoalAmount: 300000,
    doingUnitHistory: [{ amount: 500, effectiveFrom: '2026-07-10' }],
    doingChecklist: [
      { id: 'ny-passport', label: 'Get passport', isMilestone: true, done: false },
      { id: 'ny-flights', label: 'Book flights', isMilestone: false, done: false },
      { id: 'ny-hotel', label: 'Reserve a hotel', isMilestone: false, done: false },
    ],
    doingCompletedAt: null,
    createdAt: '2026-07-10',
  },
  {
    id: 4,
    title: 'Travel alone to another country',
    mode: 'solo',
    when: 'beforeIDie',
    place: 'Anywhere',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 5,
    title: 'Build my own product',
    mode: 'solo',
    when: 'beforeIDie',
    place: 'Remote',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 6,
    title: 'Reach TOEFL 110',
    mode: 'solo',
    when: 'thisYear',
    place: 'Home',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 7,
    title: 'Learn React',
    mode: 'solo',
    when: 'thisYear',
    place: 'Home studio',
    message: 'The first time my interface felt truly my own.',
    status: 'completed',
    completedDate: '2026-06-14',
    image: null,
  },
  {
    id: 8,
    title: 'Read 100 books',
    mode: 'solo',
    when: 'beforeIDie',
    place: 'Home',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 9,
    title: 'Go camping alone',
    mode: 'solo',
    when: 'thisYear',
    place: 'National park',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 10,
    title: 'Attend a major music festival',
    mode: 'together',
    when: 'beforeIDie',
    place: 'Anywhere',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 11,
    title: 'Run a marathon',
    mode: 'together',
    when: 'beforeIDie',
    place: 'Tokyo',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
];

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
  };
}

const whenPriority = { thisYear: 0, beforeIDie: 1 };

/*
  Ranks by horizon first (This year before Before I die), then by
  creation order within the same horizon -- the intention that's been
  waiting longest at that urgency surfaces first, rather than whatever
  was added most recently.
*/
export function getNextUpcoming(buckets) {
  const open = buckets.filter((bucket) => bucket.status !== 'completed');
  if (!open.length) {
    return null;
  }

  return open.slice().sort((a, b) => {
    const priorityDiff = whenPriority[a.when] - whenPriority[b.when];
    return priorityDiff !== 0 ? priorityDiff : a.id - b.id;
  })[0];
}

export function getStatusLabel(bucket) {
  return bucket.status === 'completed' ? 'Completed' : 'Planned';
}
