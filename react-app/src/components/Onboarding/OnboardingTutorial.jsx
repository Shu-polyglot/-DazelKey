import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { spring, transitions, easing } from '../../styles/motion';
import './OnboardingTutorial.css';

const SWIPE_THRESHOLD = 60;

// Same thin-stroke glyphs BottomNav uses for these four tabs (see that
// file's own icon comments), redrawn here always in their "selected"
// filled state -- a tutorial card is naturally read as pointing at
// something, not toggling it.
function BucketListGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path
        d="M3 18.5 L9 8 L12.3 12.8 L14.6 9.3 L21 18.5 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MomentumGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path
        d="M3 12 H7 L10 20 L14 4 L17 12 H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="12" r="1.6" fill="currentColor" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function AchievementGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10 H20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 3.5 V7.5 M16 3.5 V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="10.4" y="12.4" width="3.2" height="3.2" rx="0.8" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ExploreGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <circle cx="10.3" cy="10.3" r="6.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 15 L20 20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

// Five beats, meaning before mechanics -- each one names what a corner
// of the app is *for*, not what its buttons do. Copy is written to slot
// into the same quiet, second-person voice as the rest of the app (see
// TopPrioritySection's empty state, BucketStepEditor's message
// placeholder) rather than reading like release notes.
const SLIDES = [
  {
    eyebrow: 'DAZELKEY',
    title: 'Some wants are too big for a to-do list.',
    body: "This is where you keep the ones you're building a life around — and the proof, once you've lived them.",
    Glyph: null,
  },
  {
    eyebrow: 'THE BUCKET LIST',
    title: 'Start with what you want — and where.',
    body: 'Write it down before you know how. The wanting comes first.',
    Glyph: BucketListGlyph,
  },
  {
    eyebrow: 'MOMENTUM',
    title: 'Some wants need money. Watch yours get closer.',
    body: 'Log what you put toward it, one contribution at a time, and watch the distance close.',
    Glyph: MomentumGlyph,
  },
  {
    eyebrow: 'THE ACHIEVEMENT',
    title: 'When you do it, this becomes your story.',
    body: 'Every want you complete lives here after — yours to keep, or yours to share.',
    Glyph: AchievementGlyph,
  },
  {
    eyebrow: 'EXPLORE',
    title: 'See what everyone else is chasing.',
    body: 'Add the ones who inspire you as friends. Then go start on your own.',
    Glyph: ExploreGlyph,
  },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easing.emphasized } },
  exit: {
    opacity: 0,
    scale: 1.03,
    filter: 'blur(12px)',
    transition: { duration: 0.6, ease: easing.exit },
  },
};

const slideVariants = {
  enter: (direction) => ({ opacity: 0, x: direction >= 0 ? 40 : -40, filter: 'blur(6px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: (direction) => ({ opacity: 0, x: direction >= 0 ? -40 : 40, filter: 'blur(6px)', transition: transitions.exit }),
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  First-run walkthrough, shown once (see useOnboardingTutorial) right
  after the boot sequence's quote card, and replayable any time from
  the profile panel. `onClose` fires both on Skip and on finishing the
  last card -- the caller decides what that means (App.jsx marks the
  first-run flag and enters the dashboard; ProfilePanel's replay just
  closes back to the profile modal without touching that flag), so this
  component itself has no opinion about what happens next.
*/
function OnboardingTutorial({ onClose }) {
  const [[index, direction], setIndex] = useState([0, 0]);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  function goTo(nextIndex) {
    setIndex(([current]) => [nextIndex, nextIndex >= current ? 1 : -1]);
  }

  function handleNext() {
    if (isLast) {
      onClose();
      return;
    }
    goTo(index + 1);
  }

  function handleDragEnd(_event, info) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      handleNext();
    } else if (info.offset.x > SWIPE_THRESHOLD && index > 0) {
      goTo(index - 1);
    }
  }

  return (
    <motion.div
      className="onboarding-tutorial"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
    >
      <motion.button
        type="button"
        className="onboarding-tutorial-skip"
        onClick={onClose}
        whileHover={{ y: -1, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.94, transition: spring.press }}
      >
        Skip
      </motion.button>

      <div className="onboarding-tutorial-stage">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            className="onboarding-tutorial-card"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
          >
            {slide.Glyph && (
              <span className="onboarding-tutorial-icon">
                <slide.Glyph />
              </span>
            )}
            <p className="onboarding-tutorial-eyebrow">{slide.eyebrow}</p>
            <h2 className="onboarding-tutorial-title">{slide.title}</h2>
            <p className="onboarding-tutorial-body">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onboarding-tutorial-footer">
        <div className="onboarding-tutorial-dots" role="tablist" aria-label="Tutorial progress">
          {SLIDES.map((item, dotIndex) => (
            <button
              key={item.eyebrow}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={item.eyebrow}
              className={`onboarding-tutorial-dot${dotIndex === index ? ' is-active' : ''}${dotIndex < index ? ' is-done' : ''}`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>

        <motion.button type="button" className="onboarding-tutorial-next" onClick={handleNext} {...tapProps}>
          {isLast ? 'Enter DazelKey' : 'Next'}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default OnboardingTutorial;
