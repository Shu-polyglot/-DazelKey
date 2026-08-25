import { motion } from 'motion/react';
import { useLongPress } from '../../hooks/useLongPress';
import { spring } from '../../styles/motion';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  A goal's card: its identity-commitment sentence (tap to open
  GoalDetail, a read-only look back at this goal's Records Timeline;
  long-press for the Edit/Delete menu, editing's only entry point --
  see useLongPress and GoalEditModal) and, below it, an "Action" button
  -- Core's whole recording mechanism now that habits are retired. No
  day slot, no streak: tapping Action always opens a fresh record (see
  ActionRecordModal) that just adds to this goal's Records Timeline,
  as many times as the user wants.
*/
// `recordCount` (retired habit-tracking data's own cumulative count) is
// deliberately not in this destructure -- TopPrioritySection still
// computes and passes it, purely to keep that calculation provably
// error-free now that nothing renders it; see topPriority.js's own
// header comment for why that data stays.
function GoalCard({ priority, onOpen, onOpenMenu, onAddAction, readOnly = false }) {
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

      {!readOnly && (
        <motion.button
          type="button"
          className="primary-button priority-action-button"
          onClick={() => onAddAction(priority.id)}
          {...tapProps}
        >
          + Action
        </motion.button>
      )}
    </article>
  );
}

export default GoalCard;
