/*
  Money-progress math for a Realize goal (a Have Bucket tracked on
  Strategy). Progress is the sum of two sources: `contributions` (every
  Log Money entry -- the only way new progress gets added today) and
  `votes` (a frozen, read-only leftover from the retired per-card daily
  vote -- nothing writes new ones, but a goal that already had some keeps
  what it earned, resolved against its own doingUnitHistory rather than a
  bare tally).
*/

// Resolves what one vote was worth on a given date -- not just "the
// current unit" -- so raising or lowering the daily unit later never
// rewrites what past votes already contributed. `unitHistory` is
// `[{ amount, effectiveFrom }]`, oldest first.
export function getUnitAmountForDate(unitHistory, date) {
  if (!unitHistory.length) {
    return 0;
  }
  let applicable = unitHistory[0].amount;
  for (const entry of unitHistory) {
    if (entry.effectiveFrom <= date) {
      applicable = entry.amount;
    } else {
      break;
    }
  }
  return applicable;
}

export function getVoteProgress(bucket, votes) {
  return votes
    .filter((vote) => vote.goalId === bucket.id)
    .reduce((sum, vote) => sum + getUnitAmountForDate(bucket.doingUnitHistory, vote.date), 0);
}

// Earned and Saved both count the same toward progress -- a dollar
// earned and a dollar not spent move the goal forward identically. The
// tag only exists for the separate "Saved so far" display below.
export function getExtraProgress(bucket, contributions) {
  return contributions.filter((c) => c.goalId === bucket.id).reduce((sum, c) => sum + c.amount, 0);
}

export function getSavedTotal(bucket, contributions) {
  return contributions
    .filter((c) => c.goalId === bucket.id && c.tag === 'saved')
    .reduce((sum, c) => sum + c.amount, 0);
}

export function getTotalProgress(bucket, votes, contributions) {
  return getVoteProgress(bucket, votes) + getExtraProgress(bucket, contributions);
}

export function getProgressPercent(bucket, totalProgress) {
  if (!bucket.doingGoalAmount) {
    return 0;
  }
  return Math.min(100, (totalProgress / bucket.doingGoalAmount) * 100);
}

export function formatMoney(amount) {
  return `¥${Math.round(amount || 0).toLocaleString('en-US')}`;
}
