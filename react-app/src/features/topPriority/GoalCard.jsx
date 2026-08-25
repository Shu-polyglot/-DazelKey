import HabitWeekGrid from './HabitWeekGrid';
import { useLongPress } from '../../hooks/useLongPress';

/*
  A goal's card: its identity-commitment sentence (tap to open
  GoalDetail for habit management/history, long-press for the Edit/
  Delete menu -- see useLongPress), and -- directly below, no tap
  required -- that goal's own HabitWeekGrid, so today's habits and
  their recent days are visible at a glance on Core itself. The grid
  isn't nested inside the title's tap area, so its own cell taps
  (which open HabitCellModal) never fight the card's own gestures.
*/
function GoalCard({ priority, habits, recordCount, getLog, onOpen, onOpenMenu, onSelectCell, readOnly = false }) {
  const longPress = useLongPress(() => onOpenMenu(priority.id));

  function handleTap() {
    if (longPress.consumeLongPress()) {
      return;
    }
    onOpen();
  }

  return (
    <article className="priority-card">
      <div className="priority-tap-area" onClick={handleTap} {...(readOnly ? {} : longPress.handlers)}>
        <p className="priority-commitment">{priority.title}</p>
        {recordCount > 0 && (
          <p className="priority-record-count">
            {recordCount} small act{recordCount === 1 ? '' : 's'} toward this
          </p>
        )}
      </div>

      {habits.length === 0 ? (
        <p className="priority-summary priority-tap-area" onClick={handleTap}>
          {readOnly ? 'No habits yet' : 'No habits yet -- tap to add one'}
        </p>
      ) : (
        <HabitWeekGrid habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
      )}
    </article>
  );
}

export default GoalCard;
