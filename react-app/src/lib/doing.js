/*
  Money-progress math for a Doing goal (a Have Bucket tracked on
  Strategy). Deliberately layered on top of the *existing* vote engine
  rather than a parallel one: `votes` here is the exact same array
  useVotes() already produces for Become goals, just read against a
  goal's own doingUnitHistory instead of counted as a bare tally.
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

export function getCurrentUnitAmount(unitHistory) {
  return unitHistory.length ? unitHistory[unitHistory.length - 1].amount : 0;
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
