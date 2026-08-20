import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { pickOpeningAchievements } from '../../data/openingSequence';
import { formatDate } from '../../lib/dates';
import { easing } from '../../styles/motion';
import './Onboarding.css';

const ENABLE_DELAY_MS = 600;
const ROTATE_INTERVAL_MS = 3800;

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

/*
 * Netflix's "Trending Now" rail, aimed at the user's own life: the exact
 * same completed+photographed buckets WelcomeStep's corner cards draw
 * from (see pickOpeningAchievements), now given one full-screen slot
 * each and crossfading on its own clock. The rotation and the "press
 * Enter to continue" advance are deliberately independent -- the banner
 * keeps cycling underneath, on its own timer, while it waits for input.
 * Shown between the title (OpeningExperience) and the quote card
 * (TransitionRitual), whose fade timing this mirrors; the caller skips
 * this screen entirely when there's nothing to show (see
 * hasOpeningAchievements).
 */
function AchievementBanner({ buckets, onContinue }) {
  const items = useMemo(() => pickOpeningAchievements(buckets), [buckets]);
  const [index, setIndex] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const current = items[index] || null;

  useEffect(() => {
    if (items.length < 2) {
      return undefined;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    const timer = setTimeout(() => setCanContinue(true), ENABLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canContinue) {
      return undefined;
    }
    function handleKeyDown(event) {
      if (event.key === 'Enter') {
        onContinue();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canContinue, onContinue]);

  return (
    <motion.div
      className="achievement-banner"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      onClick={canContinue ? onContinue : undefined}
      style={{ cursor: canContinue ? 'pointer' : 'default' }}
    >
      <p className="achievement-banner-eyebrow">Recently Lived</p>

      <div className="achievement-banner-frame">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              className="achievement-banner-photo"
              style={{ backgroundImage: `url(${current.image})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: easing.emphasized }}
            />
          )}
        </AnimatePresence>
        <div className="achievement-banner-scrim" />
        {current && (
          <div className="achievement-banner-caption">
            <p className="achievement-banner-title">{current.title}</p>
            <p className="achievement-banner-date">{formatDate(current.date)}</p>
          </div>
        )}
      </div>

      <motion.p
        className="achievement-banner-prompt"
        initial={{ opacity: 0 }}
        animate={{ opacity: canContinue ? 1 : 0 }}
        transition={{ duration: 0.6, ease: easing.emphasized }}
      >
        Press Enter to continue
      </motion.p>
    </motion.div>
  );
}

export default AchievementBanner;
