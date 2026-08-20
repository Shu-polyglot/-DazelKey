import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { whenOptions, whenLabels, modeOptions, modeLabels, goalTypeOptions, goalTypeLabels } from '../../lib/buckets';
import { spring, transitions } from '../../styles/motion';
import './BucketStepEditor.css';

const BASE_STEPS = ['title', 'goalType', 'when', 'mode', 'message'];

// Become buckets get two extra steps -- the identity commitment and (all
// optional) personal milestones -- slotted in right after the Have/Become
// choice so they read as part of deciding what kind of Bucket this is,
// not a bolted-on afterthought.
function getSteps(goalType) {
  return goalType === 'become'
    ? ['title', 'goalType', 'commitment', 'milestones', 'when', 'mode', 'message']
    : BASE_STEPS;
}

const STEP_LABELS = {
  title: 'Bucket title',
  goalType: 'Have or Become',
  commitment: 'Who you want to become',
  milestones: 'Personal milestones',
  when: 'When you want it',
  mode: 'Who this is with',
  message: 'A message to your future self',
};

const MILESTONE_PLACEHOLDERS = [
  'Take a mock exam',
  'Run my first 5K',
  'Show my work to someone',
];

const BLANK_BUCKET = {
  title: '',
  mode: 'solo',
  when: 'soon',
  message: '',
  goalType: 'have',
  commitment: '',
  customMilestones: [],
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

function StepDots({ steps, current }) {
  return (
    <div className="step-editor-dots" role="tablist" aria-label="Edit progress">
      {steps.map((key, index) => (
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
 */
function BucketStepEditor({ bucket, onCancel, onSave }) {
  const isCreating = !bucket;
  const source = bucket || BLANK_BUCKET;

  const [title, setTitle] = useState(source.title);
  const [mode, setMode] = useState(source.mode);
  const [when, setWhen] = useState(source.when);
  const [message, setMessage] = useState(source.message || '');
  const [goalType, setGoalType] = useState(source.goalType || 'have');
  const [commitment, setCommitment] = useState(source.commitment || '');
  const [milestones, setMilestones] = useState(() => {
    const saved = source.customMilestones || [];
    return [0, 1, 2].map((index) => saved[index] || '');
  });
  const [[step, direction], setStep] = useState([0, 0]);
  const advanceTimeout = useRef(null);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const steps = getSteps(goalType);
  const stepKey = steps[step];
  const isLastStep = step === steps.length - 1;
  const titleEmpty = !title.trim();
  const commitmentEmpty = goalType === 'become' && !commitment.trim();

  function goNext() {
    setStep(([current]) => [Math.min(current + 1, getSteps(goalType).length - 1), 1]);
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
    if (stepKey === 'commitment' && commitmentEmpty) {
      return;
    }
    goNext();
  }

  function handleMilestoneChange(index, value) {
    setMilestones((prev) => prev.map((entry, entryIndex) => (entryIndex === index ? value : entry)));
  }

  function handleGoalTypePick(option) {
    setGoalType(option);
    clearTimeout(advanceTimeout.current);
    advanceTimeout.current = setTimeout(goNext, 220);
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
    if (commitmentEmpty) {
      setStep([steps.indexOf('commitment'), -1]);
      return;
    }

    onSave({
      title: trimmedTitle,
      mode,
      when,
      message: message.trim(),
      goalType,
      commitment: goalType === 'become' ? commitment.trim() : '',
      customMilestones:
        goalType === 'become' ? milestones.map((entry) => entry.trim()).filter(Boolean) : [],
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

      case 'goalType':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Is this something to have, or someone to become?</p>
            <div className="step-editor-chip-row" role="group" aria-label="Goal type">
              {goalTypeOptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  className={`step-editor-chip${goalType === option ? ' is-active' : ''}`}
                  onClick={() => handleGoalTypePick(option)}
                  {...chipTap}
                >
                  {goalTypeLabels[option]}
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'commitment':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">Who are you becoming? Say it as a person, not a task.</p>
            <label className="step-editor-field-label" htmlFor="step-commitment-input">
              <span className="sr-only">Commitment</span>
              <input
                id="step-commitment-input"
                type="text"
                className="step-editor-field-input"
                value={commitment}
                onChange={(event) => setCommitment(event.target.value)}
                onKeyDown={handleEnterKey}
                placeholder="A person who studies English every day."
                autoFocus
              />
            </label>
          </div>
        );

      case 'milestones':
        return (
          <div className="step-editor-block">
            <p className="step-editor-eyebrow">
              Any personal milestones along the way? Optional -- skip if none come to mind.
            </p>
            <div className="step-editor-milestones">
              {milestones.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  className="step-editor-field-input"
                  value={value}
                  onChange={(event) => handleMilestoneChange(index, event.target.value)}
                  onKeyDown={handleEnterKey}
                  placeholder={`e.g. ${MILESTONE_PLACEHOLDERS[index]}`}
                  autoFocus={index === 0}
                />
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
        <StepDots steps={steps} current={step} />
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
            disabled={(stepKey === 'title' && titleEmpty) || (stepKey === 'commitment' && commitmentEmpty)}
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
