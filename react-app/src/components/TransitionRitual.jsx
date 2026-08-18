import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { getRandomQuote } from '../data/quotes';
import { easing } from '../styles/motion';
import './TransitionRitual.css';

const ENABLE_DELAY_MS = 600;

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

/**
 * Full-screen ritual shown between screens: a single quote, read at the
 * reader's own pace, dismissed only by pressing Enter. Not a loading
 * state -- there's nothing being awaited underneath, just a deliberate
 * beat before the next screen appears.
 */
function TransitionRitual({ onContinue }) {
  const quote = useMemo(() => getRandomQuote(), []);
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
      // "Press Enter to continue" only has a keyboard to fall back to on
      // desktop -- on mobile there is no key to press, so the ritual also
      // has to advance on a plain tap/click anywhere on the screen once
      // canContinue's fade-in beat has passed.
      onClick={canContinue ? onContinue : undefined}
      style={{ cursor: canContinue ? 'pointer' : 'default' }}
    >
      <div className="transition-ritual-content">
        <motion.p className="transition-ritual-quote" variants={quoteVariants}>
          &ldquo;{quote.text}&rdquo;
        </motion.p>
        <motion.p className="transition-ritual-attribution" variants={attributionVariants}>
          {quote.author}
          {quote.source ? <span className="transition-ritual-source"> &mdash; {quote.source}</span> : null}
        </motion.p>
      </div>

      <motion.p
        className="transition-ritual-prompt"
        initial={{ opacity: 0 }}
        animate={{ opacity: canContinue ? 1 : 0 }}
        transition={{ duration: 0.6, ease: easing.emphasized }}
      >
        Press Enter to continue
      </motion.p>
    </motion.div>
  );
}

export default TransitionRitual;
