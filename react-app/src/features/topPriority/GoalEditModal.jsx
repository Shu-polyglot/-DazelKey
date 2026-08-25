import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
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
  edit). Used to also carry habit add/remove here (see AddHabitForm),
  but habits are retired -- Core records Actions instead, added from
  the card itself (see GoalCard), not through an edit screen -- so this
  is just the one field now.
*/
function GoalEditModal({ priority, onSave, onClose }) {
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
