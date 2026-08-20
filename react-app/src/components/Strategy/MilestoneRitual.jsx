import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { getRandomMilestoneIdiom } from '../../data/milestoneIdioms';
import { getRandomCompletionIdiom } from '../../data/doingCompletionIdioms';
import { easing } from '../../styles/motion';
import '../TransitionRitual.css';

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

const quoteVariants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay: 0.3, ease: easing.emphasized },
  },
};

const attributionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.6, ease: easing.emphasized } },
};

/*
  Strategy's special-vote celebration -- same full-screen ritual shell as
  TransitionRitual (reusing its CSS as-is, see the import), just a random
  growth idiom instead of a book quote, and the goal's own name/identity
  standing in for an author line. No numbers here on purpose -- "10
  votes" would read as a game score; the caption keeps the moment about
  which goal this was for, not how many there have been.

  `variant="completion"` is the one step up from an ordinary milestone --
  a Doing goal's money target actually reached -- and draws from its own
  idiom pool (data/doingCompletionIdioms.js) so that moment reads as
  distinctly rarer than the regular one.
*/
function MilestoneRitual({ caption, variant = 'milestone', onContinue }) {
  const idiom = useMemo(
    () => (variant === 'completion' ? getRandomCompletionIdiom() : getRandomMilestoneIdiom()),
    [variant],
  );
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
        onContinue();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canContinue, onContinue]);

  return (
    <motion.div
      className="transition-ritual"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
      onClick={canContinue ? onContinue : undefined}
      style={{ cursor: canContinue ? 'pointer' : 'default' }}
    >
      <div className="transition-ritual-content">
        <motion.p className="transition-ritual-quote" variants={quoteVariants}>
          {idiom}
        </motion.p>
        {caption && (
          <motion.p className="transition-ritual-attribution" variants={attributionVariants}>
            {caption}
          </motion.p>
        )}
      </div>

      <motion.p
        className="transition-ritual-prompt"
        initial={{ opacity: 0 }}
        animate={{ opacity: canContinue ? 1 : 0 }}
        transition={{ duration: 0.6, ease: easing.emphasized }}
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
}

export default MilestoneRitual;
