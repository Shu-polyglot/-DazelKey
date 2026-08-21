import { todayIso } from './dates';

export const STORAGE_KEY = 'life-os-buckets-v2';

/*
  A Bucket is a future intention, not a scheduled task. There is
  deliberately no planning-time date — `when` is a horizon, not a
  calendar entry. The only concrete date anywhere in this model is
  `completedDate`, which only ever exists once the experience actually
  happened.
*/
export const whenOptions = ['soon', 'thisYear', 'longTerm', 'beforeIDie'];

export const whenLabels = {
  soon: 'Soon',
  thisYear: 'This year',
  longTerm: 'Long term',
  beforeIDie: 'Before I die',
};

export const modeOptions = ['solo', 'together'];

export const modeLabels = {
  solo: 'Solo',
  together: 'Together',
};

/*
  A Bucket is either something to Have (an experience, a possession --
  the original model above) or someone to Become (an identity, tracked by
  Strategy's daily votes instead of a single completedDate). Become
  Buckets are never created through BucketStepEditor -- Strategy creates
  them directly by activating a trait from data/traits.js, so a Become
  Bucket's `title` is always exactly a trait name (see StrategyPage /
  useActivateTrait-style creation in App.jsx). `commitment` is carried
  along equal to the trait name for any older display code that still
  reads it.
*/
export const goalTypeOptions = ['have', 'become'];

export const goalTypeLabels = {
  have: 'Have',
  become: 'Become',
};

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
    when: 'soon',
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
    when: 'longTerm',
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
    when: 'longTerm',
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
    when: 'soon',
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
    when: 'soon',
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
    when: 'longTerm',
    place: 'Tokyo',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
  },
  {
    id: 12,
    title: 'Focused',
    mode: 'solo',
    when: 'longTerm',
    place: '',
    message: '',
    status: 'planned',
    completedDate: null,
    image: null,
    goalType: 'become',
    commitment: 'Focused',
    customMilestones: ['Finish a whole deep-work session without checking my phone', 'Ship something I kept putting off'],
    // Fictional demo history, same spirit as the other seed dates above --
    // far enough back that Strategy's vote grid has real weeks to show.
    createdAt: '2026-07-10',
  },
];

export function normalizeBucket(bucket, index) {
  const safeStatus = bucket.status === 'completed' ? 'completed' : 'planned';
  const safeMode = modeOptions.includes(bucket.mode) ? bucket.mode : 'solo';
  const safeWhen = whenOptions.includes(bucket.when) ? bucket.when : 'beforeIDie';
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
    commitment: safeGoalType === 'become' ? bucket.commitment || '' : '',
    // Up to 3 personal milestones the user names for themselves at
    // creation -- Strategy lets a matching day's vote be hand-marked
    // special against one of these, separately from the automatic
    // vote-count thresholds (see useVotes).
    customMilestones:
      safeGoalType === 'become' && Array.isArray(bucket.customMilestones)
        ? bucket.customMilestones.filter(Boolean).slice(0, 3)
        : [],
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

const whenPriority = { soon: 0, thisYear: 1, longTerm: 2, beforeIDie: 3 };

/*
  Ranks by horizon first (Soon before This year before Long term before
  Before I die), then by creation order within the same horizon -- the
  intention that's been waiting longest at that urgency surfaces first,
  rather than whatever was added most recently.
*/
export function getNextUpcoming(buckets) {
  const open = buckets.filter((bucket) => bucket.status !== 'completed' && bucket.goalType !== 'become');
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
