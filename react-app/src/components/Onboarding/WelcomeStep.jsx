import { motion } from 'motion/react';
import { spring, easing, transitions } from '../../styles/motion';

const sequenceVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

const TITLE_DELAY = 0.6;
const CTA_DELAY = TITLE_DELAY + 1.4;

/**
 * The opening beat of Life OS: the sea/sun backdrop keeps rolling while
 * the title settles into the center of the frame, unhurried, with Enter
 * following a beat behind it.
 */
function WelcomeStep({ onEnter }) {
  return (
    <motion.div
      className="opening-sequence"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={sequenceVariants}
    >
      <div className="opening-finale">
        <motion.h1
          className="opening-title"
          initial={{ opacity: 0, y: 14, scale: 0.97, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: TITLE_DELAY, ease: easing.emphasized }}
        >
          Life OS
        </motion.h1>

        <motion.button
          type="button"
          className="opening-cta"
          onClick={onEnter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: CTA_DELAY, ease: easing.emphasized }}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          Enter
        </motion.button>
      </div>
    </motion.div>
  );
}

export default WelcomeStep;
