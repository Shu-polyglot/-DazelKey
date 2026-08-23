import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { easing } from '../../styles/motion';
import './CompleteScreen.css';

const ENABLE_DELAY_MS = 500;

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

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.88, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.65, delay: 0.2, ease: easing.emphasized },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(8px)',
    transition: { duration: 0.3, ease: easing.exit },
  },
};

/*
  The screen every Achievement-generating completion now lands on -- a
  plain Bucket completing (App.jsx's handleCompleteBucket) or a Realize/
  Doing goal reaching 100% (handleAchievementPhotoDone). Replaces the old
  AchievementBurst particle celebration with a single full-screen beat in
  the same "ritual" tone as MilestoneRitual/TransitionRitual (same overlay
  fade + settle timing, no particles, no dim-then-navigate jack), just the
  achievement's own card standing in for the quote. Persistence has
  already happened by the time this mounts -- this is presentation only.

  `achievement` is the same data an AchievementCard would show: image,
  title, completedDate, place, message. No new fields.
*/
function CompleteScreen({ achievement, onDone }) {
  const [canContinue, setCanContinue] = useState(false);

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
        onDone();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canContinue, onDone]);

  const hasPhoto = Boolean(achievement?.image);
  const hasMeta = Boolean(achievement?.completedDate || achievement?.place);

  return (
    <motion.div
      className="complete-screen"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      onClick={canContinue ? onDone : undefined}
      style={{ cursor: canContinue ? 'pointer' : 'default' }}
    >
      <motion.div className="complete-screen-card" variants={cardVariants}>
        <div className="complete-screen-frame">
          {hasPhoto ? (
            <div className="complete-screen-photo" style={{ backgroundImage: `url(${achievement.image})` }} />
          ) : (
            <div className="complete-screen-glow" />
          )}
          <div className="complete-screen-scrim" />
          <div className="complete-screen-content">
            <span className="complete-screen-eyebrow">Achievement unlocked</span>
            <h2 className="complete-screen-title">{achievement?.title}</h2>
            {hasMeta && (
              <div className="complete-screen-meta">
                {achievement.completedDate && <span>{formatDate(achievement.completedDate)}</span>}
                {achievement.place && <span>{achievement.place}</span>}
              </div>
            )}
            {achievement?.message && <p className="complete-screen-memory">“{achievement.message}”</p>}
          </div>
        </div>
      </motion.div>

      <motion.p
        className="complete-screen-prompt"
        initial={{ opacity: 0 }}
        animate={{ opacity: canContinue ? 1 : 0 }}
        transition={{ duration: 0.6, ease: easing.emphasized }}
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
}

export default CompleteScreen;
