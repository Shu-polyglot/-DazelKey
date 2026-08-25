import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import HabitRecordsTimeline from './HabitRecordsTimeline';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

/*
  A goal's full screen -- read-only. Editing (the identity-commitment
  sentence) lives entirely behind the card's own long-press Edit menu
  (see GoalEditModal), never here. What's left, Records Timeline, is
  this screen's only content: a look back at every Action recorded
  against this goal, given the whole screen instead of half of it
  behind a toggle.
*/
function GoalDetail({ priority, actions, onSelectAction, onClose }) {
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

      <HabitRecordsTimeline actions={actions} onSelectAction={onSelectAction} />
    </Modal>
  );
}

export default GoalDetail;
