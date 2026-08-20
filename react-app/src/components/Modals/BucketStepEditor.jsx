import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { whenOptions, whenLabels, modeOptions, modeLabels } from '../../lib/buckets';
import { spring, transitions } from '../../styles/motion';
import './BucketStepEditor.css';

const STEPS = ['title', 'when', 'mode', 'message'];

const STEP_LABELS = {
  title: 'Bucket title',
  when: 'When you want it',
  mode: 'Who this is with',
  message: 'A message to your future self',
};

const BLANK_BUCKET = {
  title: '',
  mode: 'solo',
  when: 'soon',
  message: '',
};

const stepVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? 32 : -32,
    scale: 0.97,
    filter: 'blur(6px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: transitions.emphasis,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? -32 : 32,
    scale: 0.97,
    filter: 'blur(6px)',
    transition: transitions.exit,
  }),
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const chipTap = {
  whileHover: { scale: 1.04, transition: spring.hover },
  whileTap: { scale: 0.92, transition: spring.press },
};

function StepDots({ current }) {
  return (
    <div className="step-editor-dots" role="tablist" aria-label="Edit progress">
      {STEPS.map((key, index) => (
        <span
          key={key}
          role="tab"
          aria-selected={index === current}
          aria-label={STEP_LABELS[key]}
          className={`step-editor-dot${index === current ? ' is-active' : ''}${index < current ? ' is-done' : ''}`}
        />
      ))}
    </div>
  );
}

/**
 * One step-at-a-time surface for defining a future life experience --
 * title (the experience and where it happens, combined), how far away it
 * feels, who it's with, and an optional note to whoever you'll be when it
 * happens. Used both to create a new Bucket (no `bucket` prop) and to
 * edit an existing one. Existing Buckets may still carry a `place` value
 * from before this field was folded into the title; it's preserved on
 * save (via updateBucket's merge) even though it's no longer editable here.
 *
 * Do-only: Become Buckets (traits) are never created or edited here --
 * see StrategyPage / TraitQuiz, which activate a trait directly with no
 * wizard at all.
 */
function BucketStepEditor({ bucket, onCancel, onSave }) {
  const isCreating = !bucket;
  const source = bucket || BLANK_BUCKET;

  const [title, setTitle] = useState(source.title);
  const [mode, setMode] = useState(source.mode);
  const [when, setWhen] = useState(source.when);
  const [message, setMessage] = useState(source.message || '');
  const [[step, direction], setStep] = useState([0, 0]);
  const advanceTimeout = useRef(null);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const stepKey = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const titleEmpty = !title.trim();

  function goNext() {
    setStep(([current]) => [Math.min(current + 1, STEPS.length - 1), 1]);
  }

  function goBack() {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep(([current]) => [Math.max(current - 1, 0), -1]);
  }

  function handleNext() {
    if (stepKey === 'title' && titleEmpty) {
      return;
    }
    goNext();
  }

  function handleModePick(option) {
    setMode(option);
    clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(goNext, 220);
  }

  function handleWhenPick(option) {
    setWhen(option);
    clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(goNext, 220);
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setStep([0, -1]);
      return;
    }

    onSave({
      title: trimmedTitle,
      mode,
      when,
      message: message.trim(),
    });
  }

  function handleEnterKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNext();
    }
  }

  function renderStep() {
    switch (stepKey) {
      case 'title':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">What do you want to make happen — and where?</p>
            <label className="step-editor-title-label" htmlFor="step-title-input">
              <span className="sr-only">Title</span>
              <input
                id="step-title-input"
                type="text"
                className="step-editor-title-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={handleEnterKey}
                placeholder="Watch the Northern Lights in Iceland"
                autoFocus
              />
            </label>
          </div>
        );

      case 'when':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">When do you want to make it happen?</p>
            <div className="step-editor-chip-row" role="group" aria-label="When">
              {whenOptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  className={`step-editor-chip${when === option ? ' is-active' : ''}`}
                  onClick={() => handleWhenPick(option)}
                  {...chipTap}
                >
                  {whenLabels[option]}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'mode':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Who is this with?</p>
            <div className="step-editor-chip-row" role="group" aria-label="Mode">
              {modeOptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  className={`step-editor-chip${mode === option ? ' is-active' : ''}`}
                  onClick={() => handleModePick(option)}
                  {...chipTap}
                >
                  {modeLabels[option]}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'message':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">A message to the you who achieves this</p>
            <label className="step-editor-field-label" htmlFor="step-message-input">
              <span className="sr-only">Message</span>
              <textarea
                id="step-message-input"
                className="step-editor-note-input"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Don’t forget how badly you wanted this."
                autoFocus
              />
            </label>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="step-editor">
      <div className="step-editor-topbar">
        <StepDots current={step} />
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Cancel"
          onClick={onCancel}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <div className="step-editor-stage">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={stepKey}
            className="step-editor-panel"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="step-editor-footer">
        <motion.button type="button" className="secondary-button" onClick={goBack} {...tapProps}>
          Back
        </motion.button>

        {isLastStep ? (
          <motion.button type="button" className="primary-button" onClick={handleSave} {...tapProps}>
            {isCreating ? 'Add to The Bucket List' : 'Save'}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            className="primary-button"
            onClick={handleNext}
            disabled={stepKey === 'title' && titleEmpty}
            {...tapProps}
          >
            Next
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default BucketStepEditor;
