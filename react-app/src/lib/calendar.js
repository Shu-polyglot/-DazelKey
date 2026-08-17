import { toIsoDate } from './dates';

export function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const firstDay = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ muted: true, day: null, isoDate: null });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ muted: false, day, isoDate: toIsoDate(year, month, day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ muted: true, day: null, isoDate: null });
  }

  return cells;
}

export function getBucketMatchesForDate(buckets, dateString) {
  return buckets.filter((bucket) => {
    if (bucket.dateType === 'exact' && bucket.targetDate === dateString) {
      return true;
    }

    if (bucket.completedDate === dateString) {
      return true;
    }

    return false;
  });
}
