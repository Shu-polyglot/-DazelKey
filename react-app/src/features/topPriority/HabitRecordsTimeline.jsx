import { formatDate } from '../../lib/dates';

// Every one of this goal's recorded Actions, newest first -- the same
// filter-then-sort-by-date shape the Archive's own Story sequence
// builds its chronological reel with (see lib/archive.js's
// buildYearStorySequence), applied here to Actions instead of completed
// Buckets. Kept local rather than imported: that helper's shape is
// Bucket-specific (completedDate, image, message), so this is the same
// pattern applied to a different schema, not a shared call.
function buildTimeline(actions) {
  return actions.slice().sort((a, b) => b.time.localeCompare(a.time));
}

/*
  "Records Timeline" -- GoalDetail's only content, and Core's whole
  look-back mechanism now that habits are retired: every Action recorded
  against this goal (see GoalCard's "Action" button / ActionRecordModal),
  not day-by-day habit logs. Tapping an entry reopens the exact same
  ActionRecordModal the Action button itself opens (via the shared
  onSelectAction prop), just already carrying that entry -- no new
  photo/journal viewer, just this list feeding the one that already
  exists.

  Still named for the habit-log system it replaced -- see this module's
  other files for the same "Core"/"priority" naming holdover -- and its
  own old habit/log data is untouched in storage, just not shown here
  yet (see topPriority.js's own header comment).
*/
function HabitRecordsTimeline({ actions, onSelectAction }) {
  const entries = buildTimeline(actions);

  if (entries.length === 0) {
    return <p className="priority-empty-note">No records yet -- tap Action to add the first one.</p>;
  }

  return (
    <ul className="habit-records-timeline">
      {entries.map((action) => (
        <li key={action.id}>
          <button type="button" className="habit-record-row" onClick={() => onSelectAction(action)}>
            <span
              className={`habit-record-thumb${action.photo ? ' has-photo' : ''}`}
              style={action.photo ? { backgroundImage: `url(${action.photo})` } : undefined}
              aria-hidden="true"
            >
              {!action.photo && (action.journal ? '📝' : '✓')}
            </span>
            <span className="habit-record-meta">
              <span className="habit-record-date">{formatDate(action.time.slice(0, 10))}</span>
              {action.journal && <span className="habit-record-journal">{action.journal}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default HabitRecordsTimeline;
