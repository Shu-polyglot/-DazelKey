import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../Modals/Modal';
import { formatMoney, getProgressPercent } from '../../lib/doing';
import { spring, transitions } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './Strategy.css';

const STEPS = ['goal', 'amount', 'tag', 'confirm'];
const QUICK_AMOUNTS = [1000, 5000, 10000];
const TAGS = [
  { value: 'earned', label: 'Earned' },
  { value: 'saved', label: 'Saved' },
];

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
  Realize's single, unified money-logging action -- replaces the old
  per-card daily vote + "Add extra" pair with one flow: pick the goal,
  enter an amount, tag it Earned/Saved (optional), and land on a fourth
  read-only step that says exactly what that entry did. `goals` carries
  each goal's `current` progress (computed once by the caller, via
  getTotalProgress) so the confirmation step's percent reflects this
  entry landing on top of it, without re-deriving totals in here.
*/
function LogMoneyFlow({ goals, onLogMoney, onClose }) {
  const [goalId, setGoalId] = useState(null);
  const [amount, setAmount] = useState('');
  const [tag, setTag] = useState(null);
  const [result, setResult] = useState(null);
  const [[step, direction], setStep] = useState([0, 0]);

  const stepKey = STEPS[step];
  const selectedGoal = goals.find((goal) => goal.id === goalId) || null;
  const amountValid = Number(amount) > 0;

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

  function handleGoalPick(id) {
    setGoalId(id);
    setTimeout(goNext, 220);
  }

  function handleQuickAmount(value) {
    setAmount((prev) => String((Number(prev) || 0) + value));
  }

  function handleNext() {
    if (stepKey === 'goal' && !goalId) {
      return;
    }
    if (stepKey === 'amount' && !amountValid) {
      return;
    }
    goNext();
  }

  function handleLog() {
    if (!selectedGoal || !amountValid) {
      return;
    }
    const value = Number(amount);
    onLogMoney(selectedGoal.id, value, tag);
    const percent = Math.round(getProgressPercent({ doingGoalAmount: selectedGoal.target }, selectedGoal.current + value));
    setResult({ amount: value, percent, title: selectedGoal.title });
    goNext();
  }

  function renderStep() {
    switch (stepKey) {
      case 'goal':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Which goal is this for?</p>
            <div className="add-goal-bucket-list">
              {goals.map((goal) => (
                <motion.button
                  key={goal.id}
                  type="button"
                  className={`add-goal-bucket-row${goalId === goal.id ? ' is-active' : ''}`}
                  onClick={() => handleGoalPick(goal.id)}
                  {...tapProps}
                >
                  {goal.title}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'amount':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">How much are you logging, toward {selectedGoal?.title}?</p>
            <div className="doing-quick-amounts">
              {QUICK_AMOUNTS.map((value) => (
                <motion.button
                  key={value}
                  type="button"
                  className="step-editor-chip"
                  onClick={() => handleQuickAmount(value)}
                  whileHover={{ scale: 1.04, transition: spring.hover }}
                  whileTap={{ scale: 0.92, transition: spring.press }}
                >
                  +{formatMoney(value)}
                </motion.button>
              ))}
            </div>
            <label className="step-editor-field-label" htmlFor="log-money-amount-input">
              <span className="sr-only">Amount</span>
              <input
                id="log-money-amount-input"
                type="number"
                inputMode="numeric"
                min="1"
                className="step-editor-field-input"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Amount"
                autoFocus
              />
            </label>
          </div>
        );

      case 'tag':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Earned or saved? Optional -- skip if neither fits.</p>
            <div className="doing-tag-row" role="group" aria-label="Tag (optional)">
              {TAGS.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  className={`step-editor-chip${tag === option.value ? ' is-active' : ''}`}
                  onClick={() => setTag((prev) => (prev === option.value ? null : option.value))}
                  whileHover={{ scale: 1.04, transition: spring.hover }}
                  whileTap={{ scale: 0.92, transition: spring.press }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="step-editor-block">
            <p className="log-money-confirm">
              {formatMoney(result?.amount)} contributed — now at {result?.percent}% toward {result?.title}.
            </p>
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
          <div className="step-editor-dots" role="tablist" aria-label="Log Money progress">
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
          {stepKey === 'confirm' ? (
            <motion.button type="button" className="primary-button log-money-done-button" onClick={onClose} {...tapProps}>
              Done
            </motion.button>
          ) : (
            <>
              <motion.button type="button" className="secondary-button" onClick={goBack} {...tapProps}>
                Back
              </motion.button>
              {stepKey === 'tag' ? (
                <motion.button type="button" className="primary-button" onClick={handleLog} disabled={!amountValid} {...tapProps}>
                  Log Money
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  className="primary-button"
                  onClick={handleNext}
                  disabled={(stepKey === 'goal' && !goalId) || (stepKey === 'amount' && !amountValid)}
                  {...tapProps}
                >
                  Next
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default LogMoneyFlow;
