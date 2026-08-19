import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { whenOptions, whenLabels, modeOptions, modeLabels } from '../../lib/buckets';
import { spring, transitions } from '../../styles/motion';
import './BucketStepEditor.css';

const STEPS = ['title', 'mode', 'when', 'place', 'message', 'confirm'];

const STEP_LABELS = {
  title: 'Name the intention',
  mode: 'Who this is with',
  when: 'When you want it',
  place: 'Where',
  message: 'A message to your future self',
  confirm: 'Review',
};

const BLANK_BUCKET = {
  title: '',
  mode: 'solo',
  when: 'soon',
  place: '',
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
 * title, who it's with, how far away it feels, where, and an optional
 * note to whoever you'll be when it happens. Used both to create a new
 * Bucket (no `bucket` prop) and to edit an existing one.
 */
function BucketStepEditor({ bucket, onCancel, onSave }) {
  const isCreating = !bucket;
  const source = bucket || BLANK_BUCKET;

  const [title, setTitle] = useState(source.title);
  const [mode, setMode] = useState(source.mode);
  const [when, setWhen] = useState(source.when);
  const [place, setPlace] = useState(source.place || '');
  const [message, setMessage] = useState(source.message || '');
  const [[step, direction], setStep] = useState([0, 0]);
  const advanceTimeout = useRef(null);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const stepKey = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const titleEmpty = !title.trim();
  const placeEmpty = !place.trim();

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
    if (stepKey === 'place' && placeEmpty) {
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
    if (!place.trim()) {
      setStep([3, -1]);
      return;
    }

    onSave({
      title: trimmedTitle,
      mode,
      when,
      place: place.trim(),
      message: message.trim(),
    });
  }

  function handleEnterKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleNext();
    }
  }

  function isStepSkippable() {
    if (stepKey === 'message') return !message.trim();
    return false;
  }

  function renderStep() {
    switch (stepKey) {
      case 'title':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">What do you want to make happen?</p>
            <label className="step-editor-title-label" htmlFor="step-title-input">
              <span className="sr-only">Title</span>
              <input
                id="step-title-input"
                type="text"
                className="step-editor-title-input"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={handleEnterKey}
                placeholder="Run a marathon"
                autoFocus
              />
            </label>
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

      case 'place':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Where will this happen?</p>
            <label className="step-editor-field-label" htmlFor="step-place-input">
              <span className="sr-only">Place</span>
              <input
                id="step-place-input"
                type="text"
                className="step-editor-field-input"
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                onKeyDown={handleEnterKey}
                placeholder="Bali"
                autoFocus
              />
            </label>
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

      case 'confirm':
      default:
        return (
          <div className="step-editor-block step-editor-confirm">
            <p className="step-editor-eyebrow">Here's the shape of it</p>
            <h3 className="step-editor-confirm-title">{title.trim() || 'Untitled intention'}</h3>
            <div className="step-editor-confirm-meta">
              <div className="step-editor-confirm-item">
                <span className="label">Mode</span>
                <span className="value">{modeLabels[mode]}</span>
              </div>
              <div className="step-editor-confirm-item">
                <span className="label">When</span>
                <span className="value">{whenLabels[when]}</span>
              </div>
              <div className="step-editor-confirm-item">
                <span className="label">Place</span>
                <span className="value">{place.trim() || 'Not set'}</span>
              </div>
            </div>
            {message.trim() && (
              <div className="step-editor-confirm-note">
                <span className="label">Message</span>
                <p className="value">{message.trim()}</p>
              </div>
            )}
          </div>
        );
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
            disabled={(stepKey === 'title' && titleEmpty) || (stepKey === 'place' && placeEmpty)}
            {...tapProps}
          >
            {isStepSkippable() ? 'Skip' : 'Next'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default BucketStepEditor;
