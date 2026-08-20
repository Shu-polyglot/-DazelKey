import { todayIso, toIsoDate } from './dates';

/*
  Every calendar day from `startIso` through `endIso`, oldest first -- the
  one canonical day list both the compact card preview and the full detail
  grid slice or window, so "which days count" never drifts between them.
*/
export function getDateRange(startIso, endIso = todayIso()) {
  const start = new Date(startIso + 'T12:00:00');
  const end = new Date(endIso + 'T12:00:00');
  const days = [];
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    days.push(toIsoDate(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()));
  }
  return days;
}

/*
  Groups the goal's full history into GitHub-style week columns (Sun..Sat
  rows), padding the first column with nulls so the real start date lands
  on its correct weekday instead of always starting a fresh column at Sun.
*/
export function buildWeeks(startIso, endIso = todayIso()) {
  const days = getDateRange(startIso, endIso);
  if (!days.length) {
    return [];
  }

  const leadingBlanks = new Date(days[0] + 'T12:00:00').getDay();
  const cells = [...Array(leadingBlanks).fill(null), ...days];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// "18 of the last 30 days" -- windowed to the goal's actual age when it's
// younger than the window, so a goal started last week reads "5 of the
// last 6 days" instead of a misleading "5 of the last 30".
export function getVoteSummary(votes, startIso, windowDays = 30) {
  const allDays = getDateRange(startIso);
  const recentDays = allDays.slice(Math.max(0, allDays.length - windowDays));
  const votedDates = new Set(votes.map((vote) => vote.date));
  const voted = recentDays.filter((day) => votedDates.has(day)).length;
  return { voted, total: recentDays.length };
}
