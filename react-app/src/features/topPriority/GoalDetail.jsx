import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import AddHabitForm from './AddHabitForm';
import HabitWeekGrid from './HabitWeekGrid';
import HabitHistoryHeatmap from './HabitHistoryHeatmap';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

/*
  A goal's full screen: its identity-commitment title (unchanged from
  Core's old single-tier version), habit registration, and the two
  heatmap sections (7-day window + collapsible 12-week history). The
  goal itself holds no vote/progress data -- everything below reads
  habits/logs scoped to this goal's id.
*/
function GoalDetail({ priority, habits, getLog, onAddHabit, onDeleteHabit, onSelectCell, onClose, readOnly = false }) {
  return (
    <Modal onClose={onClose} className="detail-modal priority-detail-modal">
      <div className="modal-header detail-header">
        <div>
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

      <AddHabitForm
        habits={habits}
        onAdd={(name) => onAddHabit(priority.id, name)}
        onDelete={onDeleteHabit}
        readOnly={readOnly}
      />

      {habits.length === 0 ? (
        <p className="priority-empty-note">Add a habit above to start recording days.</p>
      ) : (
        <>
          <HabitWeekGrid habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
          <HabitHistoryHeatmap habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
        </>
      )}
    </Modal>
  );
}

export default GoalDetail;
