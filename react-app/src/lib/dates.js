export function formatMonth(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDate(value) {
  if (!value) {
    return 'No date set';
  }

  const date = new Date(value + 'T12:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function toIsoDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayIso() {
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// A calendar year's progress in days, for the Core page's year progress
// widget. totalDays is 365 or 366 depending on leap year; elapsedDays is
// today's 1-based day-of-year, so today always lands on the last filled
// box.
export function getYearDayProgress(now = new Date()) {
  const year = now.getFullYear();
  const totalDays = isLeapYear(year) ? 366 : 365;

  const startOfYear = new Date(year, 0, 1);
  const startOfToday = new Date(year, now.getMonth(), now.getDate());
  const elapsedDays = Math.min(totalDays, Math.round((startOfToday - startOfYear) / MS_PER_DAY) + 1);

  const percentage = totalDays ? Math.round((elapsedDays / totalDays) * 100) : 0;

  return { year, totalDays, elapsedDays, percentage };
}

// Bar-position percentages for the start of each month after January
// (Feb 1 through Dec 1) -- the year progress bar's month-boundary
// ticks. January's own start is the bar's left edge, so it isn't
// included as a tick.
export function getMonthBoundaryPercentages(year, totalDays) {
  const startOfYear = new Date(year, 0, 1);
  const percentages = [];
  for (let month = 1; month < 12; month += 1) {
    const monthStart = new Date(year, month, 1);
    const dayOfYear = Math.round((monthStart - startOfYear) / MS_PER_DAY) + 1;
    percentages.push(((dayOfYear - 1) / totalDays) * 100);
  }
  return percentages;
}
