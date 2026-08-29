import { getYearDayProgress } from '../../lib/dates';

/*
  Core page's own "20XX is Y% done." widget -- a single progress bar for
  the year (see lib/dates' getYearDayProgress), with a thin tick at each
  week boundary instead of the one-box-per-day grid this used to carry
  underneath it (that grid's density read as trypophobia-triggering no
  matter how it was spaced/sized -- a plain bar sidesteps that entirely).
  Purely a static read, no tap target.
*/
function YearProgressWidget() {
  const { year, totalDays, elapsedDays, percentage } = getYearDayProgress();
  // Interior week boundaries only -- day 7, 14, 21... -- skipping day 0
  // (the bar's own left edge) and stopping before day `totalDays` (the
  // right edge), so ticks only ever mark divisions the bar's ends
  // already imply.
  const weekTickCount = Math.floor((totalDays - 1) / 7);
  const weekTickPositions = Array.from({ length: weekTickCount }, (_, index) => ((index + 1) * 7 * 100) / totalDays);

  return (
    <div className="year-progress-widget">
      <div className="year-progress-header">
        <p className="year-progress-heading">
          {year} is {percentage}% done.
        </p>
        <p className="year-progress-caption">
          Day {elapsedDays} of {totalDays}
        </p>
      </div>
      <div className="year-progress-bar-track">
        <div className="year-progress-bar-fill" style={{ width: `${percentage}%` }} />
        <div className="year-progress-bar-ticks" aria-hidden="true">
          {weekTickPositions.map((pct, index) => (
            <span key={index} className="year-progress-bar-tick" style={{ left: `${pct}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default YearProgressWidget;
