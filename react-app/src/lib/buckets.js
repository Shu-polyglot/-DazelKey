export const STORAGE_KEY = 'life-os-buckets-v1';

export const allowedCategories = ['Travel', 'Career', 'Learning', 'Experience', 'Personal'];

export const defaultBuckets = [
  {
    id: 1,
    title: 'See the Northern Lights',
    category: 'Travel',
    description: 'Experience the Northern Lights in Iceland with a slow winter road trip.',
    dateType: 'someday',
    targetDate: null,
    status: 'completed',
    completedDate: '2027-03-15',
    location: 'Iceland',
    memory: 'One of the most unreal nights of my life.',
    image: null,
  },
  {
    id: 2,
    title: 'Build my first web app',
    category: 'Career',
    description: 'Create and launch my first product with a meaningful user experience.',
    dateType: 'exact',
    targetDate: '2026-08-21',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 3,
    title: 'Visit New York',
    category: 'Travel',
    description: 'Spend a week walking the city and seeing it glow after dark.',
    dateType: 'exact',
    targetDate: '2027-04-10',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 4,
    title: 'Travel alone to another country',
    category: 'Travel',
    description: 'Take a solo trip and trust the unknown to teach me something new.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 5,
    title: 'Build my own product',
    category: 'Career',
    description: 'Design and ship something useful, beautiful, and personal.',
    dateType: 'exact',
    targetDate: '2027-01-20',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 6,
    title: 'Reach TOEFL 110',
    category: 'Learning',
    description: 'Study consistently and reach a score that opens future opportunities.',
    dateType: 'exact',
    targetDate: '2026-12-15',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 7,
    title: 'Learn React',
    category: 'Learning',
    description: 'Build a personal portfolio and become comfortable with modern front-end development.',
    dateType: 'exact',
    targetDate: '2026-06-14',
    status: 'completed',
    completedDate: '2026-06-14',
    location: 'Home studio',
    memory: 'The first time my interface felt truly my own.',
    image: null,
  },
  {
    id: 8,
    title: 'Read 100 books',
    category: 'Learning',
    description: 'Read more deeply across literature, art, and ideas.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 9,
    title: 'Go camping alone',
    category: 'Experience',
    description: 'Spend one night alone in nature and listen to the silence.',
    dateType: 'exact',
    targetDate: '2026-09-20',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 10,
    title: 'Attend a major music festival',
    category: 'Experience',
    description: 'See a live set under a night sky and let the atmosphere stay with me.',
    dateType: 'someday',
    targetDate: null,
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
  {
    id: 11,
    title: 'Run a marathon',
    category: 'Personal',
    description: 'Train with patience and finish the kind of race that changes your rhythm.',
    dateType: 'exact',
    targetDate: '2027-10-30',
    status: 'planned',
    completedDate: null,
    location: '',
    memory: '',
    image: null,
  },
];

export function normalizeBucket(bucket, index) {
  const safeStatus = ['planned', 'in-progress', 'completed'].includes(bucket.status)
    ? bucket.status
    : 'planned';
  const safeDateType = bucket.dateType === 'exact' ? 'exact' : 'someday';

  return {
    id: bucket.id || index + 1,
    title: bucket.title || 'Untitled memory',
    category: allowedCategories.includes(bucket.category) ? bucket.category : 'Personal',
    description: bucket.description || '',
    dateType: safeDateType,
    targetDate: bucket.targetDate || null,
    status: safeStatus,
    completedDate: bucket.completedDate || null,
    location: bucket.location || '',
    memory: bucket.memory || '',
    image: bucket.image || null,
  };
}

export function getNextUpcoming(buckets) {
  const upcoming = buckets
    .filter((bucket) => bucket.status !== 'completed' && bucket.dateType === 'exact' && bucket.targetDate)
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate));

  return upcoming[0] || null;
}

export function getStatusLabel(bucket) {
  if (bucket.status === 'completed') {
    return 'Completed';
  }

  if (bucket.dateType === 'someday') {
    return 'Someday';
  }

  return 'Planned';
}
