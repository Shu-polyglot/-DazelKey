import { getYearDayProgress, getMonthBoundaryPercentages } from '../../lib/dates';

/*
  Core page's own "20XX is Y% done." widget -- a single progress bar for
  the year (see lib/dates' getYearDayProgress), with a thin tick at each
  month boundary instead of the one-box-per-day grid this used to carry
  underneath it (that grid's density read as trypophobia-triggering no
  matter how it was spaced/sized -- a plain bar sidesteps that entirely).
  Purely a static read, no tap target.
*/
function YearProgressWidget() {
  const { year, totalDays, elapsedDays, percentage } = getYearDayProgress();
  const monthTickPositions = getMonthBoundaryPercentages(year, totalDays);

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
          {monthTickPositions.map((pct, index) => (
            <span key={index} className="year-progress-bar-tick" style={{ left: `${pct}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default YearProgressWidget;
