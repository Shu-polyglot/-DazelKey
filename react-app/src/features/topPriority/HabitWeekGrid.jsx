import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { toIsoDate, todayIso } from '../../lib/dates';
import { spring } from '../../styles/motion';

const WEEKDAY_LABELS = [0, 1, 2, 3, 4, 5, 6].map((day) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(2024, 0, 7 + day)),
);

// Sun-Sat calendar week containing today, shifted by `offsetWeeks` --
// same week boundaries buildWeeks (see lib/votes.js) uses for the
// 12-week history grid below, so both sections agree on where a week
// starts.
function getWeekDates(offsetWeeks) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - start.getDay() + offsetWeeks * 7);

  const dates = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    dates.push(toIsoDate(day.getFullYear(), day.getMonth(), day.getDate()));
  }
  return dates;
}

/*
  The habit-log counterpart to Core's old vote grid: rows are the
  goal's habits, columns are one calendar week's 7 days, with prev/
  next navigation (capped at the current week -- no logging future
  days). `onSelectCell` fires for any past-or-today cell, whether or
  not it's done yet; HabitCellModal itself decides record vs. view.
*/
function HabitWeekGrid({ habits, getLog, readOnly = false, onSelectCell }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const today = todayIso();

  return (
    <div className="habit-week-grid">
      <div className="habit-week-grid-nav">
        <motion.button
          type="button"
          className="secondary-button habit-week-nav-button"
          onClick={() => setWeekOffset((prev) => prev - 1)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          ← Prev
        </motion.button>
        <motion.button
          type="button"
          className="secondary-button habit-week-nav-button"
          onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
          disabled={weekOffset >= 0}
          whileHover={weekOffset >= 0 ? undefined : { y: -1, transition: spring.hover }}
          whileTap={weekOffset >= 0 ? undefined : { y: 1, scale: 0.96, transition: spring.press }}
        >
          Next →
        </motion.button>
      </div>

      <div className="habit-week-grid-table">
        <div className="habit-week-grid-header">
          <span className="habit-week-grid-row-label" />
          {dates.map((date, index) => (
            <span className="habit-week-grid-day-label" key={date}>
              {WEEKDAY_LABELS[index]}
            </span>
          ))}
        </div>

        {habits.map((habit) => (
          <div className="habit-week-grid-row" key={habit.id}>
            <span className="habit-week-grid-row-label" title={habit.name}>
              {habit.name}
            </span>
            {dates.map((date) => {
              const log = getLog(habit.id, date);
              const isFuture = date > today;
              const isDisabled = isFuture || (readOnly && !log);
              const hasMoment = Boolean(log?.photo || log?.journal);
              const className = `priority-vote-cell habit-week-cell${log ? ' is-voted' : ''}${isFuture ? ' is-pad' : ''}`;
              return (
                <span
                  className={className}
                  title={date}
                  key={date}
                  onClick={isDisabled ? undefined : () => onSelectCell(habit, date, log)}
                >
                  {hasMoment && (
                    <span className="habit-cell-badge">
                      {log.photo ? '📷' : '📝'}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitWeekGrid;
