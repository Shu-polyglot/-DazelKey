import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../Modals/Modal';
import { MAX_CUSTOM_MILESTONES } from '../../lib/buckets';
import { spring, transitions } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './Strategy.css';

const STEPS = ['commitment', 'milestones'];

const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction >= 0 ? 32 : -32, scale: 0.97, filter: 'blur(6px)' }),
  center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: (direction) => ({ opacity: 0, x: direction >= 0 ? -32 : 32, scale: 0.97, filter: 'blur(6px)', transition: transitions.exit }),
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  Becoming's own counterpart to Doing's AddGoalFlow -- same one-question-
  at-a-time step-editor shell, reusing its CSS as-is. Where Doing attaches
  tracking to an existing Have Bucket, this creates a brand new Become
  Bucket outright from a freeform identity-commitment sentence: the big,
  long-term thing someone's becoming, not a trait pick. Custom milestones
  are optional and every one of them IS a milestone (unlike Doing's mixed
  checklist), so there's no "mark as milestone" toggle here.
*/
function AddBecomeFlow({ onSave, onClose }) {
  const [commitment, setCommitment] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [[step, direction], setStep] = useState([0, 0]);

  const stepKey = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const commitmentValid = commitment.trim().length > 0;
  const atMilestoneCap = milestones.length >= MAX_CUSTOM_MILESTONES;

  function goNext() {
    setStep(([current]) => [Math.min(current + 1, STEPS.length - 1), 1]);
  }

  function goBack() {
    if (step === 0) {
      onClose();
      return;
    }
    setStep(([current]) => [Math.max(current - 1, 0), -1]);
  }

  function handleNext() {
    if (stepKey === 'commitment' && !commitmentValid) {
      return;
    }
    goNext();
  }

  function handleAddMilestone() {
    const label = newMilestone.trim();
    if (!label || atMilestoneCap) {
      return;
    }
    setMilestones((prev) => [...prev, label]);
    setNewMilestone('');
  }

  function handleRemoveMilestone(index) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!commitmentValid) {
      return;
    }
    onSave({ commitment: commitment.trim(), customMilestones: milestones });
  }

  function renderStep() {
    switch (stepKey) {
      case 'commitment':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">What's a big goal you're becoming, over the long term?</p>
            <label className="step-editor-field-label" htmlFor="become-commitment-input">
              <span className="sr-only">Identity commitment</span>
              <textarea
                id="become-commitment-input"
                className="step-editor-field-input add-become-commitment-input"
                value={commitment}
                onChange={(event) => setCommitment(event.target.value)}
                placeholder="e.g. Get into Aoyama Gakuin University's English & American Literature program"
                rows={3}
                autoFocus
              />
            </label>
          </div>
        );

      case 'milestones':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Any milestones along the way? Optional -- skip if none come to mind.</p>

            {milestones.length > 0 && (
              <div className="add-goal-checklist-preview">
                {milestones.map((label, index) => (
                  <div className="add-goal-checklist-preview-item" key={`${label}-${index}`}>
                    <span>★ {label}</span>
                    <button type="button" className="icon-button" aria-label={`Remove ${label}`} onClick={() => handleRemoveMilestone(index)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {atMilestoneCap ? (
              <p className="add-goal-empty">Up to {MAX_CUSTOM_MILESTONES} milestones -- remove one to add another.</p>
            ) : (
              <div className="add-goal-checklist-form">
                <input
                  type="text"
                  className="step-editor-field-input"
                  value={newMilestone}
                  onChange={(event) => setNewMilestone(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleAddMilestone();
                    }
                  }}
                  placeholder="e.g. Qualify for the regional round"
                />
                <motion.button type="button" className="secondary-button" onClick={handleAddMilestone} {...tapProps}>
                  + Add milestone
                </motion.button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <Modal onClose={onClose} className="step-editor-modal">
      <div className="step-editor">
        <div className="step-editor-topbar">
          <div className="step-editor-dots" role="tablist" aria-label="Add a Goal progress">
            {STEPS.map((key, index) => (
              <span key={key} className={`step-editor-dot${index === step ? ' is-active' : ''}${index < step ? ' is-done' : ''}`} />
            ))}
          </div>
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
          <AnimatePresence custom={direction} mode="wait">
            <motion.div key={stepKey} className="step-editor-panel" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit">
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="step-editor-footer">
          <motion.button type="button" className="secondary-button" onClick={goBack} {...tapProps}>
            Back
          </motion.button>

          {isLastStep ? (
            <motion.button type="button" className="primary-button" onClick={handleSave} disabled={!commitmentValid} {...tapProps}>
              Add to Strategy
            </motion.button>
          ) : (
            <motion.button type="button" className="primary-button" onClick={handleNext} disabled={!commitmentValid} {...tapProps}>
              Next
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default AddBecomeFlow;
