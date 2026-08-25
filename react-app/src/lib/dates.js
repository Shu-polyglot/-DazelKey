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

// Monday of the week containing `date` (local time) -- same Mon-start
// convention as every other week view in this app (HabitTodayGrid's
// getCurrentWeekDates, CalendarPanel's day grid).
function startOfWeek(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  return start;
}

function weeksBetween(a, b) {
  return Math.round((b - a) / MS_PER_DAY / 7);
}

// A calendar year's progress in Mon-start weeks, for the Core page's year
// progress widget. `year`'s first/last week each anchor to the Monday on
// or before Jan 1 / Dec 31 (so, like any Mon-start week grid, a few days
// of the neighboring year can share dot 1 or the last dot) -- totalWeeks
// is the count of those weeks end to end, always 52 or 53. elapsedWeeks
// counts every week whose Monday has arrived by `now`, current week
// included, so today always lands on a filled dot.
export function getYearWeekProgress(now = new Date()) {
  const year = now.getFullYear();
  const firstWeekStart = startOfWeek(new Date(year, 0, 1));
  const lastWeekStart = startOfWeek(new Date(year, 11, 31));
  const totalWeeks = weeksBetween(firstWeekStart, lastWeekStart) + 1;

  const currentWeekStart = startOfWeek(now);
  const elapsedWeeks = Math.min(totalWeeks, Math.max(0, weeksBetween(firstWeekStart, currentWeekStart) + 1));

  const percentage = totalWeeks ? Math.round((elapsedWeeks / totalWeeks) * 100) : 0;

  return { year, totalWeeks, elapsedWeeks, percentage };
}
