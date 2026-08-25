import HabitTodayGrid from './HabitTodayGrid';
import { useLongPress } from '../../hooks/useLongPress';

/*
  A goal's card: its identity-commitment sentence (tap to open
  GoalDetail, a read-only look back at this goal's Records Timeline;
  long-press for the Edit/Delete menu, editing's only entry point --
  see useLongPress and GoalEditModal), and -- directly below, no tap
  required -- that goal's own HabitTodayGrid, so today's habits are
  visible and actionable at a glance on Core itself. The grid isn't
  nested inside the title's tap area, so its own cell taps (which open
  HabitCellModal) never fight the card's own gestures.
*/
// `recordCount` (the goal's cumulative done-day count) is deliberately
// not in this destructure -- TopPrioritySection still computes and
// passes it, kept around for whatever reuses it next, but this card no
// longer renders a "N small acts toward this" line from it.
function GoalCard({ priority, habits, getLog, onOpen, onOpenMenu, onSelectCell, readOnly = false }) {
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
      </div>

      {habits.length === 0 ? (
        <p className="priority-summary priority-tap-area" onClick={handleTap}>
          {readOnly ? 'No habits yet' : 'No habits yet -- tap to add one'}
        </p>
      ) : (
        <HabitTodayGrid habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
      )}
    </article>
  );
}

export default GoalCard;
