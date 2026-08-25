import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import AddHabitForm from './AddHabitForm';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import '../../components/Modals/BucketStepEditor.css';
import './topPriority.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  The goal card's long-press "Edit" destination: its one text field
  (see topPriority.js's updatePriority -- "title" already IS the
  identity-commitment sentence, there's no separate short label to
  edit) plus the same habit add/remove surface GoalDetail already
  offers, reused here rather than rebuilt (see AddHabitForm). Habit
  removal here goes through the caller's onRemoveHabit, which decides
  archive vs. delete per habit -- this component has no opinion on
  that, same as AddHabitForm's own onDelete prop never has.
*/
function GoalEditModal({ priority, habits, onAddHabit, onRemoveHabit, onSave, onClose }) {
  const [title, setTitle] = useState(priority.title);
  const trimmed = title.trim();

  function handleSave() {
    if (!trimmed) {
      return;
    }
    onSave({ title: trimmed });
  }

  return (
    <Modal onClose={onClose} className="detail-modal goal-edit-modal">
      <div className="modal-header detail-header">
        <div>
          <h3>Edit priority</h3>
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

      <label className="step-editor-field-label habit-cell-journal-label" htmlFor="goal-edit-title">
        <span className="sr-only">Identity commitment</span>
        <textarea
          id="goal-edit-title"
          className="step-editor-field-input habit-cell-journal-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          rows={3}
        />
      </label>

      <AddHabitForm habits={habits} onAdd={(name) => onAddHabit(priority.id, name)} onDelete={onRemoveHabit} />

      <div className="detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onClose} {...tapProps}>
          Cancel
        </motion.button>
        <motion.button type="button" className="primary-button" onClick={handleSave} disabled={!trimmed} {...tapProps}>
          Save
        </motion.button>
      </div>
    </Modal>
  );
}

export default GoalEditModal;
