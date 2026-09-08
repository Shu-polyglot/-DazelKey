/*
  Digital Opportunity Loss -- `**DazelKey — Social Impact**.md`'s DOL
  concept (Time x Attention x Potential), scaled down to what can
  actually be shown honestly: no Screen Time API exists for any
  third-party app (web or native -- this isn't a PWA limitation, Apple
  simply never exposes it), so this never claims to measure *this*
  person's real usage. Instead it pairs a disclosed, cited population
  average (the "how much" half) with this person's own real, unfinished
  Bucket List (the "what it could become" half) -- the honesty is in
  keeping those two halves clearly separate, never blending them into a
  single number that looks more precise than it is.

  Source for the average: NTTドコモ モバイル社会研究所 (2024年1月調査),
  "私用等（仕事・学校を除く）" internet/smartphone use --
  https://www.moba-ken.jp/project/lifestyle/20250221.html
  10s女性 5.2h, 10s男性 4.9h, 20s女性 4.5h, 20s男性 4.6h / day -- averaged
  across all four here since DazelKey doesn't collect gender, and this
  is presented as a generation-wide figure, not a personalized one.
*/
const DAILY_HOURS_SAMPLES = [5.2, 4.9, 4.5, 4.6];
export const AVERAGE_DAILY_HOURS = DAILY_HOURS_SAMPLES.reduce((sum, value) => sum + value, 0) / DAILY_HOURS_SAMPLES.length;
export const AVERAGE_WEEKLY_HOURS = AVERAGE_DAILY_HOURS * 7;
export const AVERAGE_ANNUAL_DAYS = Math.round((AVERAGE_WEEKLY_HOURS * 52) / 24);

export const STAT_SOURCE = 'NTTドコモ モバイル社会研究所, 2024年1月調査';

// The interruption-recovery citation behind the "real cost is bigger
// than the clock shows" beat -- used only as explanatory copy (see
// DigitalOpportunityLossRitual), never multiplied into the hour figures
// above. Gloria Mark's own number is 23 minutes 15 seconds; rounded down
// here since the copy only needs "over 20 minutes" to land the point.
export const ATTENTION_RECOVERY_MINUTES = 20;
export const ATTENTION_SOURCE = 'Gloria Mark, UC Irvine (2008)';

// Rough hours-per-instance for each timeCommitment tier (see
// classify-bucket-difficulty) -- coarse on purpose, only used to turn
// "quick" Buckets into a "you could do this N times" figure and to sum
// a realistic total for the whole backlog. `multiDay` is a placeholder
// (never actually used for a xN readout, see describeOpportunityExample)
// since nobody reads "camping trip x3" as a weekly-realistic claim.
export const TIME_COMMITMENT_HOURS = {
  quick: 2,
  halfDay: 4,
  fullDay: 8,
  multiDay: 24,
};

const SEASON_MONTHS = {
  winter: [11, 0, 1],
  spring: [2, 3, 4],
  summer: [5, 6, 7],
  fall: [8, 9, 10],
};

function seasonMatchesNow(seasonality, now) {
  if (!seasonality) {
    return true;
  }
  const months = SEASON_MONTHS[seasonality];
  return months ? months.includes(now.getMonth()) : true;
}

// Only open, classified (see useBucketDifficulty), currently-in-season
// Buckets are eligible at all -- nothing here should ever suggest a
// snow-only Bucket in July, or a completed one.
function getEligibleBuckets(buckets, now) {
  return buckets.filter(
    (bucket) => bucket.status !== 'completed' && bucket.difficulty && seasonMatchesNow(bucket.difficulty.seasonality, now),
  );
}

// One representative Bucket per timeCommitment tier, ascending -- a
// quick one first (most likely to feel achievable), then progressively
// bigger ones, mirroring the Social Impact note's own worked example
// (a short thing repeated several times, plus one or two bigger ones)
// rather than a random grab that could surface three near-duplicates.
export function pickOpportunityExamples(buckets, { now = new Date(), maxExamples = 3 } = {}) {
  const eligible = getEligibleBuckets(buckets, now);
  const tiers = ['quick', 'halfDay', 'fullDay', 'multiDay'];
  const examples = [];
  for (const tier of tiers) {
    if (examples.length >= maxExamples) {
      break;
    }
    const match = eligible.find((bucket) => bucket.difficulty.timeCommitment === tier);
    if (match) {
      examples.push(match);
    }
  }
  return examples;
}

// How many times this one Bucket could happen inside the given number
// of hours -- only meaningful for "quick" Buckets (nobody reads a
// multi-day trip as something to repeat weekly), capped at 5 so the
// number stays a plausible weekly rhythm rather than an absurd tally.
//
// `goalShape` (see classify-bucket-difficulty) changes what that count
// even means: a "do" Bucket ("Go to Kyoto") is genuinely a thing you
// could repeat, so "x5" reads as an invitation. A "become" Bucket
// ("Score 900 on the TOEIC") is never "done" five separate times --
// nobody reads "TOEIC prep x5" as encouraging, it reads as broken. For
// those, the same tier-derived time instead becomes hours of progress
// ("10h toward it") -- still grounded in the same classified tier, just
// described as accumulating effort rather than repeated completions.
export function describeOpportunityExample(bucket, availableHours) {
  const hoursEach = TIME_COMMITMENT_HOURS[bucket.difficulty.timeCommitment] || TIME_COMMITMENT_HOURS.quick;
  const timesThatFit =
    bucket.difficulty.timeCommitment === 'quick' ? Math.max(1, Math.min(5, Math.floor(availableHours / hoursEach))) : 1;
  const isBecome = bucket.difficulty.goalShape === 'become';
  return { bucket, timesThatFit, hoursEach, isBecome, progressHours: hoursEach * timesThatFit };
}

// Sums a realistic total for every open, classified Bucket -- the
// "your whole list" comparison. Buckets still awaiting classification
// (difficulty === null) are simply left out rather than guessed at.
function getBacklogHours(buckets) {
  return buckets
    .filter((bucket) => bucket.status !== 'completed' && bucket.difficulty)
    .reduce((sum, bucket) => sum + (TIME_COMMITMENT_HOURS[bucket.difficulty.timeCommitment] || TIME_COMMITMENT_HOURS.quick), 0);
}

// "Enough to finish your whole Bucket List, N times over, this year" --
// the one line where the statistic and the person's own real data
// collide. Returns null (not a number) whenever the comparison
// wouldn't read as credible: an empty/unclassified backlog, or a
// multiplier so large ("47x over") that it stops feeling like insight
// and starts feeling like a broken calculator -- callers fall back to
// the plain example list in either case.
const MAX_CREDIBLE_MULTIPLIER = 10;

export function getBacklogMultiplier(buckets) {
  const backlogHours = getBacklogHours(buckets);
  if (backlogHours <= 0) {
    return null;
  }
  const annualHours = AVERAGE_WEEKLY_HOURS * 52;
  const multiplier = Math.floor(annualHours / backlogHours);
  return multiplier >= 1 && multiplier <= MAX_CREDIBLE_MULTIPLIER ? multiplier : null;
}
