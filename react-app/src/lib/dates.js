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

  // How far through *today itself* `now` is, layered under elapsedDays'
  // whole-day count -- lets the widget's bar fill creep forward within
  // a single day instead of only ever jumping once at midnight, which
  // is what actually makes it read as time passing rather than a fixed
  // snapshot. Never rounded or shown as a number -- only percentage/
  // elapsedDays above are what any visible text reads.
  const msIntoToday = now - startOfToday;
  const preciseElapsedDays = Math.min(totalDays, elapsedDays - 1 + msIntoToday / MS_PER_DAY);
  const precisePercentage = totalDays ? (preciseElapsedDays / totalDays) * 100 : 0;

  return { year, totalDays, elapsedDays, percentage, precisePercentage };
}

// Bar-position ticks for the start of each month after January (Feb 1
// through Dec 1) -- the year progress bar's month-boundary marks.
// January's own start is the bar's left edge, so it isn't included.
// Each entry carries its own day-of-year alongside its bar percent so a
// tap on a tick (see YearProgressWidget) can resolve straight back to
// an exact date instead of re-deriving one from a rounded percent.
export function getMonthBoundaryPercentages(year, totalDays) {
  const startOfYear = new Date(year, 0, 1);
  const boundaries = [];
  for (let month = 1; month < 12; month += 1) {
    const monthStart = new Date(year, month, 1);
    const dayOfYear = Math.round((monthStart - startOfYear) / MS_PER_DAY) + 1;
    boundaries.push({ month, dayOfYear, percent: ((dayOfYear - 1) / totalDays) * 100 });
  }
  return boundaries;
}

// Inverse of the day-of-year math above -- turns a 1-based day-of-year
// back into an actual calendar date, for the year progress bar's
// scrubber (see YearProgressWidget) turning a tapped/dragged position
// back into a real day to show.
export function dateFromDayOfYear(year, dayOfYear) {
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (dayOfYear - 1));
  return date;
}

// "Mar 15" -- no year, for contexts (like the year progress bar's
// scrubber) where the year is already obvious from the surrounding UI.
export function formatShortDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
