import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AVERAGE_ANNUAL_DAYS,
  AVERAGE_WEEKLY_HOURS,
  ATTENTION_RECOVERY_MINUTES,
  ATTENTION_SOURCE,
  STAT_SOURCE,
  pickOpportunityExamples,
  describeOpportunityExample,
  getBacklogMultiplier,
} from '../../lib/digitalOpportunityLoss';
import { spring, transitions, easing } from '../../styles/motion';
import '../Onboarding/OnboardingTutorial.css';
import './DigitalOpportunityLossRitual.css';

const SWIPE_THRESHOLD = 60;

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
  The weekly reveal behind "見えない可能性を示す" -- see
  hooks/useDigitalOpportunityLoss for the once-per-ISO-week trigger and
  lib/digitalOpportunityLoss.js for why every number here is either a
  disclosed, cited population average or this person's own real,
  unfinished Bucket List, never blended into one falsely-precise figure.
  Deliberately built as a full-screen, multi-slide *moment* (reusing
  OnboardingTutorial's own shell/CSS as-is) rather than another inline
  card -- this is meant to land as a beat worth stopping for, the way
  MilestoneRitual/CompleteScreen do, not another thing competing for
  attention in the scroll.
*/
function DigitalOpportunityLossRitual({ buckets, onClose }) {
  const [[index, direction], setIndex] = useState([0, 0]);

  const examples = useMemo(() => pickOpportunityExamples(buckets), [buckets]);
  const backlogMultiplier = useMemo(() => getBacklogMultiplier(buckets), [buckets]);

  const slides = useMemo(() => {
    const list = [
      {
        eyebrow: 'THIS YEAR',
        title: `About ${AVERAGE_ANNUAL_DAYS} days a year.`,
        body: `People your age spend roughly ${Math.round(
          AVERAGE_WEEKLY_HOURS,
        )} hours a week online, outside work and school — more than two months a year, unfolded.`,
        footnote: STAT_SOURCE,
      },
    ];
    // Only shown when the comparison is actually credible -- see
    // getBacklogMultiplier's own comment on why a huge or empty
    // multiplier is worse than not showing this slide at all.
    if (backlogMultiplier) {
      list.push({
        eyebrow: 'YOUR BUCKET LIST',
        title: `Enough to live it all — ${backlogMultiplier}× over.`,
        body: 'Every open intention you already have, finished, with real time left over. This year alone.',
      });
    }
    list.push({
      eyebrow: 'THE REAL COST',
      title: 'Attention costs more than time.',
      body: `Each pull away can take over ${ATTENTION_RECOVERY_MINUTES} minutes to fully return. The real cost is bigger than the clock shows.`,
      footnote: ATTENTION_SOURCE,
    });
    list.push({ eyebrow: 'THIS WEEK', title: "Here's what a few hours could become.", examples: true });
    return list;
  }, [backlogMultiplier]);

  const isLast = index === slides.length - 1;
  const slide = slides[index];

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
    <motion.div className="onboarding-tutorial" initial="hidden" animate="visible" exit="exit" variants={overlayVariants}>
      <motion.button type="button" className="onboarding-tutorial-skip" onClick={onClose} {...tapProps}>
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
            <p className="onboarding-tutorial-eyebrow">{slide.eyebrow}</p>
            <h2 className="onboarding-tutorial-title">{slide.title}</h2>

            {slide.examples ? (
              <ul className="dol-example-list">
                {examples.map((bucket) => {
                  const { timesThatFit, isBecome, progressHours } = describeOpportunityExample(bucket, AVERAGE_WEEKLY_HOURS);
                  return (
                    <li className="dol-example-row" key={bucket.id}>
                      <span className="dol-example-title">{bucket.title}</span>
                      <span className="dol-example-count">{isBecome ? `${progressHours}h toward it` : `× ${timesThatFit}`}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="onboarding-tutorial-body">{slide.body}</p>
            )}

            {slide.footnote && <p className="dol-footnote">{slide.footnote}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onboarding-tutorial-footer">
        <div className="onboarding-tutorial-dots" role="tablist" aria-label="Progress">
          {slides.map((item, dotIndex) => (
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
          {isLast ? 'Make it happen' : 'Next'}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default DigitalOpportunityLossRitual;
