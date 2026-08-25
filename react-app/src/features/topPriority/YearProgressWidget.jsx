import { getYearWeekProgress } from '../../lib/dates';

/*
  Core page's own "20XX is Y% done." widget -- one dot per week of the
  current year (Mon-start, see lib/dates' getYearWeekProgress), filled
  through the week containing today. Concept reference was Pattrn's own
  dot-year card, but the look here is this app's own card/token recipe
  (see topPriority.css), not a copy of that card's black-background
  style -- purely a static read, no tap target.
*/
function YearProgressWidget() {
  const { year, totalWeeks, elapsedWeeks, percentage } = getYearWeekProgress();
  const weeks = Array.from({ length: totalWeeks }, (_, index) => index < elapsedWeeks);

  return (
    <div className="year-progress-widget">
      <p className="year-progress-heading">
        {year} is {percentage}% done.
      </p>
      <div className="year-progress-dots" aria-hidden="true">
        {weeks.map((isElapsed, index) => (
          <span key={index} className={`year-progress-dot${isElapsed ? ' is-elapsed' : ''}`} />
        ))}
      </div>
    </div>
  );
}

export default YearProgressWidget;
