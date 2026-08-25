import { toIsoDate, todayIso } from '../../lib/dates';

const WEEK_LENGTH = 7;

// The calendar week (Monday through Sunday) containing today -- fixed
// weekday order, never reshuffled to put today first (see this
// component's own header comment for why that's not the design here).
function getCurrentWeekDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = start.getDay(); // 0 = Sun ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);

  const dates = [];
  for (let i = 0; i < WEEK_LENGTH; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(toIsoDate(date.getFullYear(), date.getMonth(), date.getDate()));
  }
  return dates;
}

function formatWeekday(isoDate) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${isoDate}T12:00:00`));
}

/*
  Core list card's own habit rows -- its own thing, not shared with
  GoalDetail (which dropped its old heatmap views entirely; Records
  Timeline is its only content now). The date axis is Mon->Sun, drawn
  once in a shared header above every habit, instead of each row
  repeating its own copy of it -- every row below is then just that
  axis's checkboxes, column-aligned to the header via the same flex
  structure (.habit-today-cells). Weekday order is fixed and never
  reshuffled to put today first -- only today's own column (wherever
  it falls in the week, see todayIndex) is the one tappable one.
  Everything else, past AND future within the week, is glance-only:
  correcting a past day, or getting ahead on a future one, both still
  go through GoalDetail, which the card's own tap-to-open already
  leads to.
*/
function HabitTodayGrid({ habits, getLog, readOnly = false, onSelectCell }) {
  const dates = getCurrentWeekDates();
  const todayIndex = dates.indexOf(todayIso());

  return (
    <div className="habit-today-grid">
      <div className="habit-today-header">
        <span className="habit-today-row-label" aria-hidden="true" />
        <div className="habit-today-cells">
          {dates.map((date, index) => (
            <span className={`habit-today-day-label${index === todayIndex ? ' is-today' : ''}`} key={date}>
              {formatWeekday(date)}
            </span>
          ))}
        </div>
      </div>

      {habits.map((habit) => (
        <div className="habit-today-row" key={habit.id}>
          <span className="habit-today-row-label" title={habit.name}>
            {habit.name}
          </span>

          <div className="habit-today-cells">
            {dates.map((date, index) => {
              const isToday = index === todayIndex;
              const log = getLog(habit.id, date);
              const hasMoment = Boolean(log?.photo || log?.journal);
              const clickable = isToday && !(readOnly && !log);

              return (
                <span
                  key={date}
                  className={`priority-vote-cell habit-today-cell${isToday ? ' is-today' : ''}${log ? ' is-voted' : ''}`}
                  title={date}
                  onClick={clickable ? () => onSelectCell(habit, date, log) : undefined}
                >
                  {hasMoment && <span className="habit-cell-badge">{log.photo ? '📷' : '📝'}</span>}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HabitTodayGrid;
