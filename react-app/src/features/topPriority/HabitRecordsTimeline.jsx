import { formatDate } from '../../lib/dates';

// Every one of this goal's logged days, newest first -- the same
// filter-then-sort-by-date shape the Archive's own Story sequence
// builds its chronological reel with (see lib/archive.js's
// buildYearStorySequence), applied here to habit logs instead of
// completed Buckets. Kept local rather than imported: that helper's
// shape is Bucket-specific (completedDate, image, message), so this is
// the same pattern applied to a different schema, not a shared call.
function buildTimeline(habits, logs) {
  const habitById = new Map(habits.map((habit) => [habit.id, habit]));
  return logs
    .filter((log) => habitById.has(log.habitId))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((log) => ({ log, habit: habitById.get(log.habitId) }));
}

/*
  "Records Timeline" -- GoalDetail's other view (see its own
  priority-view-toggle), a chronological look-back over every day this
  goal's habits were actually done, in place of the heatmaps' at-a-
  glance grid read. Tapping an entry opens the exact same HabitCellModal
  the heatmaps already open (via the shared onSelectCell prop) -- no new
  photo/journal viewer, just this list feeding the one that already
  exists.
*/
function HabitRecordsTimeline({ habits, logs, onSelectCell }) {
  const entries = buildTimeline(habits, logs);

  if (entries.length === 0) {
    return <p className="priority-empty-note">No records yet -- days you complete will show up here.</p>;
  }

  return (
    <ul className="habit-records-timeline">
      {entries.map(({ log, habit }) => (
        <li key={log.id}>
          <button type="button" className="habit-record-row" onClick={() => onSelectCell(habit, log.date, log)}>
            <span
              className={`habit-record-thumb${log.photo ? ' has-photo' : ''}`}
              style={log.photo ? { backgroundImage: `url(${log.photo})` } : undefined}
              aria-hidden="true"
            >
              {!log.photo && (log.journal ? '📝' : '✓')}
            </span>
            <span className="habit-record-meta">
              <span className="habit-record-date">{formatDate(log.date)}</span>
              <span className="habit-record-habit">{habit.name}</span>
              {log.journal && <span className="habit-record-journal">{log.journal}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default HabitRecordsTimeline;
