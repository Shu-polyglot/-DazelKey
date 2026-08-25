import HabitWeekGrid from './HabitWeekGrid';

/*
  A goal's card: its identity-commitment sentence (tap to open
  GoalDetail for habit management/history), and -- directly below,
  no tap required -- that goal's own HabitWeekGrid, so today's habits
  and their recent days are visible at a glance on Core itself. The
  grid isn't nested inside the title's tap area, so its own cell taps
  (which open HabitCellModal) never fight the card's open-detail tap.
*/
function GoalCard({ priority, habits, getLog, onOpen, onSelectCell, readOnly = false }) {
  return (
    <article className="priority-card">
      <div className="priority-tap-area" onClick={onOpen}>
        <p className="priority-commitment">{priority.title}</p>
      </div>

      {habits.length === 0 ? (
        <p className="priority-summary priority-tap-area" onClick={onOpen}>
          {readOnly ? 'No habits yet' : 'No habits yet -- tap to add one'}
        </p>
      ) : (
        <HabitWeekGrid habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
      )}
    </article>
  );
}

export default GoalCard;
