import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../Modals/Modal';
import GoalPlanChat from './GoalPlanChat';
import { spring, transitions } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './Strategy.css';

const STEPS = ['bucket', 'amount', 'checklist'];

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
  The same one-question-at-a-time shell BucketStepEditor established
  (StepDots, one block per step, blur/slide transitions between them,
  reusing its CSS as-is) -- but its own component, since this attaches
  Realize tracking to an *existing* Have Bucket rather than creating a
  new one. Money only ever gets logged afterward through the tab's single
  Log Money action (see LogMoneyFlow), so this flow just sets up the
  target amount and optional checklist, nothing about daily pacing.
*/
function AddGoalFlow({ eligibleBuckets, onSave, onClose }) {
  const [bucketId, setBucketId] = useState(null);
  const [goalAmount, setGoalAmount] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemIsMilestone, setNewItemIsMilestone] = useState(false);
  const [[step, direction], setStep] = useState([0, 0]);
  const [isPlanChatOpen, setIsPlanChatOpen] = useState(false);

  const stepKey = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const goalAmountValid = Number(goalAmount) > 0;
  const selectedBucket = eligibleBuckets.find((bucket) => bucket.id === bucketId);

  // Fills this form's own amount/checklist state from GoalPlanChat's
  // finalized plan, exactly as if the person had typed those values
  // themselves -- so everything downstream (validation, the checklist
  // step's preview, handleSave) works unchanged. Ids are generated the
  // same way handleAddChecklistItem's manual entries already are.
  function handleApplyPlan(plan) {
    setGoalAmount(String(plan.goalAmount));
    setChecklist(
      plan.checklist.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        label: item.label,
        isMilestone: Boolean(item.isMilestone),
        done: false,
      })),
    );
    setIsPlanChatOpen(false);
    goNext();
  }

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

  function handleBucketPick(id) {
    setBucketId(id);
    setTimeout(goNext, 220);
  }

  function handleNext() {
    if (stepKey === 'bucket' && !bucketId) {
      return;
    }
    if (stepKey === 'amount' && !goalAmountValid) {
      return;
    }
    goNext();
  }

  function handleAddChecklistItem() {
    const label = newItemLabel.trim();
    if (!label) {
      return;
    }
    setChecklist((prev) => [...prev, { id: `item-${Date.now()}`, label, isMilestone: newItemIsMilestone, done: false }]);
    setNewItemLabel('');
    setNewItemIsMilestone(false);
  }

  function handleRemoveChecklistItem(id) {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    if (!bucketId || !goalAmountValid) {
      return;
    }
    onSave({ bucketId, goalAmount: Number(goalAmount), checklist });
  }

  function renderStep() {
    switch (stepKey) {
      case 'bucket':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Which Bucket List item is this?</p>
            {eligibleBuckets.length === 0 ? (
              <p className="add-goal-empty">
                Nothing to track yet -- every Have item is either already on Momentum or checked off. Add one from The
                Bucket List first.
              </p>
            ) : (
              <div className="add-goal-bucket-list">
                {eligibleBuckets.map((bucket) => (
                  <motion.button
                    key={bucket.id}
                    type="button"
                    className={`add-goal-bucket-row${bucketId === bucket.id ? ' is-active' : ''}`}
                    onClick={() => handleBucketPick(bucket.id)}
                    {...tapProps}
                  >
                    {bucket.title}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        );

      case 'amount':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">How much will this cost, in total?</p>
            <label className="step-editor-field-label" htmlFor="goal-amount-input">
              <span className="sr-only">Goal amount</span>
              <input
                id="goal-amount-input"
                type="number"
                inputMode="numeric"
                min="1"
                className="step-editor-field-input"
                value={goalAmount}
                onChange={(event) => setGoalAmount(event.target.value)}
                placeholder="e.g. 300000"
                autoFocus
              />
            </label>
            <motion.button type="button" className="secondary-button" onClick={() => setIsPlanChatOpen(true)} {...tapProps}>
              🪄 Ask AI to help plan this
            </motion.button>
          </div>
        );

      case 'checklist':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Any checklist items? Optional -- skip if none come to mind.</p>

            {checklist.length > 0 && (
              <div className="add-goal-checklist-preview">
                {checklist.map((item) => (
                  <div className="add-goal-checklist-preview-item" key={item.id}>
                    <span>
                      {item.isMilestone ? '★ ' : ''}
                      {item.label}
                    </span>
                    <button type="button" className="icon-button" aria-label={`Remove ${item.label}`} onClick={() => handleRemoveChecklistItem(item.id)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="add-goal-checklist-form">
              <input
                type="text"
                className="step-editor-field-input"
                value={newItemLabel}
                onChange={(event) => setNewItemLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                placeholder="e.g. Get passport"
              />
              <label className="add-goal-milestone-toggle">
                <input
                  type="checkbox"
                  checked={newItemIsMilestone}
                  onChange={(event) => setNewItemIsMilestone(event.target.checked)}
                />
                Mark as a milestone
              </label>
              <motion.button type="button" className="secondary-button" onClick={handleAddChecklistItem} {...tapProps}>
                + Add item
              </motion.button>
            </div>
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
            <motion.button type="button" className="primary-button" onClick={handleSave} disabled={!bucketId || !goalAmountValid} {...tapProps}>
              Add to Momentum
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className="primary-button"
              onClick={handleNext}
              disabled={(stepKey === 'bucket' && !bucketId) || (stepKey === 'amount' && !goalAmountValid)}
              {...tapProps}
            >
              Next
            </motion.button>
          )}
        </div>
      </div>

      {isPlanChatOpen &&
        createPortal(
          <GoalPlanChat
            goalTitle={selectedBucket?.title || 'this goal'}
            onApply={handleApplyPlan}
            onClose={() => setIsPlanChatOpen(false)}
          />,
          document.body,
        )}
    </Modal>
  );
}

export default AddGoalFlow;
