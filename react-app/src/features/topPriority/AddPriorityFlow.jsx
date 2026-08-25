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
  Creates a goal outright from a freeform identity-commitment sentence
  -- the big, long-term thing someone's becoming. Single step: habits
  (the goal's actual day-to-day units) are registered afterward, in
  GoalDetail, not at creation time.
*/
function AddPriorityFlow({ onSave, onClose }) {
  const [commitment, setCommitment] = useState('');
  const commitmentValid = commitment.trim().length > 0;

  function handleSave() {
    if (!commitmentValid) {
      return;
    }
    onSave({ commitment: commitment.trim() });
  }

  return (
    <Modal onClose={onClose} className="step-editor-modal">
      <div className="step-editor">
        <div className="step-editor-topbar">
          <div />
          <motion.button
            type="button"
            className="icon-button"
            aria-label="Cancel"
            onClick={onClose}
            whileHover={{ rotate: 90, transition: spring.hover }}
            whileTap={{ scale: 0.88, transition: spring.press }}
          >
            ×
          </motion.button>
        </div>

        <div className="step-editor-stage">
          <div className="step-editor-panel">
            <div className="step-editor-block">
              <p className="step-editor-eyebrow">What's a big goal you're becoming, over the long term?</p>
              <label className="step-editor-field-label" htmlFor="priority-commitment-input">
                <span className="sr-only">Identity commitment</span>
                <textarea
                  id="priority-commitment-input"
                  className="step-editor-field-input add-priority-commitment-input"
                  value={commitment}
                  onChange={(event) => setCommitment(event.target.value)}
                  placeholder="e.g. Get into Aoyama Gakuin University's English & American Literature program"
                  rows={3}
                  autoFocus
                />
              </label>
            </div>
          </div>
        </div>

        <div className="step-editor-footer">
          <motion.button type="button" className="secondary-button" onClick={onClose} {...tapProps}>
            Cancel
          </motion.button>
          <motion.button type="button" className="primary-button" onClick={handleSave} disabled={!commitmentValid} {...tapProps}>
            Add Priority
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}

export default AddPriorityFlow;
