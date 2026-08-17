export const DEFAULT_STORY_DURATION = 6000;

/*
  Which of the three v1 compositions a completed Bucket reads as. There is
  no category to lean on anymore, so this uses only what the new model
  actually guarantees: mode is the strongest signal (explicitly called out
  as something that should shape the Story), message presence is the next
  best one, and a plain achievement is the fallback. Inferring "travel"
  from place/title text was considered and deliberately left out --
  keyword-guessing a place name is fragile and not worth the complexity
  for what it would add.
*/
function classifyStory(bucket) {
  if (bucket.mode === 'together') {
    return 'together';
  }
  if (bucket.message) {
    return 'memory';
  }
  return 'achievement';
}

/*
  Deterministic per-bucket variation for the gradient placeholder used
  whenever a Bucket has no photo (the common case today — nothing in the
  app can set `image` yet) so a run of Stories doesn't read as the same
  card repeated.
*/
function buildGradientSeed(id) {
  const seed = Number(id) || 0;
  return {
    angle: 140 + ((seed * 47) % 80),
    shift: (seed * 31) % 40,
  };
}

function buildStoryFromBucket(bucket) {
  return {
    id: `bucket-${bucket.id}`,
    type: classifyStory(bucket),
    headline: bucket.title,
    caption: bucket.message || '',
    date: bucket.completedDate,
    place: bucket.place || '',
    when: bucket.when,
    mode: bucket.mode,
    media: {
      kind: bucket.image ? 'photo' : 'gradient',
      src: bucket.image,
      seed: buildGradientSeed(bucket.id),
    },
    linkedBucketId: bucket.id,
    duration: DEFAULT_STORY_DURATION,
  };
}

function buildNowStory(buckets) {
  const completed = buckets.filter((bucket) => bucket.status === 'completed').length;

  return {
    id: 'now',
    type: 'now',
    headline: 'This is where you are.',
    caption:
      completed > 0
        ? `${completed} experience${completed === 1 ? '' : 's'} archived — and still going.`
        : 'Nothing archived yet — but the story starts today.',
    duration: Infinity,
  };
}

/*
  Oldest -> newest, ending on a synthesized "now" beat that is never user
  data, only ever a live read of the current archive at the moment the
  user opens it.
*/
export function buildArchiveSequence(buckets) {
  const stories = buckets
    .filter((bucket) => bucket.status === 'completed')
    .slice()
    .sort((a, b) => (a.completedDate || '').localeCompare(b.completedDate || ''))
    .map(buildStoryFromBucket);

  return [...stories, buildNowStory(buckets)];
}
