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

// The one place completedDate is turned into a calendar year -- every
// other Year-aware helper below reads through this, so a bucket with no
// date (or an unparsable one) consistently has no year rather than
// silently sorting into whichever year happens to come first.
function getCalendarYear(dateStr) {
  if (!dateStr) {
    return null;
  }
  const ms = new Date(`${dateStr}T12:00:00`).getTime();
  if (Number.isNaN(ms)) {
    return null;
  }
  return new Date(ms).getFullYear();
}

// Real calendar years that actually have a completed experience in them --
// never a fixed/synthetic range -- newest first, so Year Navigation always
// opens on "now" and lets the user step backward through their own
// history.
export function getArchiveYears(buckets) {
  const years = new Set();
  buckets.forEach((bucket) => {
    if (bucket.status !== 'completed') {
      return;
    }
    const year = getCalendarYear(bucket.completedDate);
    if (year !== null) {
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
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
  The reel for one selected calendar year -- oldest -> newest within that
  year, ending on the same synthesized "now" beat every year's reel ends
  on (never user data, just a live read of the current archive), so
  finishing playback always reaches the same Return/bridge hand-off no
  matter which year was being explored. `year: null` (nothing in the
  archive to select) still returns a valid one-beat reel.
*/
export function buildYearStorySequence(buckets, year) {
  if (year === null || year === undefined) {
    return [buildNowStory(buckets)];
  }

  const stories = buckets
    .filter((bucket) => bucket.status === 'completed' && getCalendarYear(bucket.completedDate) === year)
    .slice()
    .sort((a, b) => (a.completedDate || '').localeCompare(b.completedDate || ''))
    .map(buildStoryFromBucket);

  return [...stories, buildNowStory(buckets)];
}
