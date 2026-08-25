import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import HabitRecordsTimeline from './HabitRecordsTimeline';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

/*
  A goal's full screen -- read-only now. Editing (the identity-
  commitment sentence, habit add/remove) used to live partly here too
  (an AddHabitForm above a Heatmap/Records Timeline toggle), but that
  duplicated the card's own long-press Edit menu (see GoalEditModal),
  so it's gone from here entirely -- editing is that menu's job alone
  now. What's left, Records Timeline, is this screen's only content: a
  look back at every day this goal's habits were actually done, given
  the whole screen instead of half of it behind a toggle.
*/
function GoalDetail({ priority, allHabits, logs, onSelectCell, onClose }) {
  return (
    <Modal onClose={onClose} className="detail-modal priority-detail-modal">
      <div className="modal-header detail-header">
        <div>
          <span className="section-label">Core</span>
          <h3>{priority.title}</h3>
        </div>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <HabitRecordsTimeline habits={allHabits} logs={logs} onSelectCell={onSelectCell} />
    </Modal>
  );
}

export default GoalDetail;
