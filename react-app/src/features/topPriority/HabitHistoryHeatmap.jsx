import { useMemo, useState } from 'react';
import { buildWeeks } from '../../lib/votes';
import { toIsoDate, todayIso } from '../../lib/dates';

const HISTORY_WEEKS = 12;

function subtractDays(isoDate, days) {
  const date = new Date(isoDate + 'T12:00:00');
  date.setDate(date.getDate() - days);
  return toIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
}

function levelForRatio(ratio) {
  if (ratio <= 0) return 0;
  if (ratio < 0.5) return 1;
  if (ratio < 1) return 2;
  return 3;
}

/*
  Collapsible GitHub-contribution-style companion to HabitWeekGrid's
  7-day window -- same week-columns/weekday-rows shape (via
  lib/votes.js's buildWeeks, the exact utility Core's old single-goal
  grid used), just spanning the last 12 weeks. Two read modes: every
  habit's daily completion ratio shaded like a normal contribution
  graph (tap disabled -- there's no single log to open), or one habit's
  own done/undone cells (tap opens HabitCellModal, same as the 7-day
  grid).
*/
function HabitHistoryHeatmap({ habits, getLog, readOnly = false, onSelectCell }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState('aggregate');

  const weeks = useMemo(() => {
    const startIso = subtractDays(todayIso(), HISTORY_WEEKS * 7 - 1);
    return buildWeeks(startIso).slice(-HISTORY_WEEKS);
  }, []);

  const selectedHabit = habits.find((habit) => String(habit.id) === selectedHabitId) || null;
  const isAggregate = !selectedHabit;

  function ratioForDate(date) {
    if (habits.length === 0) return 0;
    const doneCount = habits.filter((habit) => getLog(habit.id, date)).length;
    return doneCount / habits.length;
  }

  return (
    <div className="habit-history-heatmap">
      <button type="button" className="habit-history-toggle" onClick={() => setIsExpanded((prev) => !prev)}>
        {isExpanded ? '▾' : '▸'} Past records
      </button>

      {isExpanded && (
        <>
          <div className="habit-history-mode-row">
            <select
              className="habit-history-select"
              value={selectedHabitId}
              onChange={(event) => setSelectedHabitId(event.target.value)}
            >
              <option value="aggregate">All habits (combined rate)</option>
              {habits.map((habit) => (
                <option value={habit.id} key={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>

          <div className="habit-history-grid">
            <div className="habit-history-grid-columns">
              {weeks.map((week, weekIndex) => (
                <div className="habit-history-grid-week" key={weekIndex}>
                  {week.map((date, dayIndex) => {
                    if (!date) {
                      return <span className="priority-vote-cell is-pad" key={dayIndex} />;
                    }

                    if (isAggregate) {
                      const ratio = ratioForDate(date);
                      const level = levelForRatio(ratio);
                      return (
                        <span
                          className={`priority-vote-cell habit-history-cell is-level-${level}`}
                          title={date}
                          key={date}
                        />
                      );
                    }

                    const log = getLog(selectedHabit.id, date);
                    const isDisabled = readOnly && !log;
                    const className = `priority-vote-cell habit-history-cell${log ? ' is-voted' : ''}`;
                    return (
                      <span
                        className={className}
                        title={date}
                        key={date}
                        onClick={isDisabled ? undefined : () => onSelectCell(selectedHabit, date, log)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HabitHistoryHeatmap;
