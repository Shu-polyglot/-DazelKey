import { motion } from 'motion/react';
import { spring, easing, transitions } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.webp';

const sequenceVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

const TITLE_DELAY = 0.6;
const CTA_DELAY = TITLE_DELAY + 1.4;

/**
 * The opening beat of DazelKey: a static black background with the logo
 * fading in, Enter following a beat behind it. No video, no elaborate
 * reveal -- just the lockup settling into place.
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
        <motion.div
          className="opening-logo-wrap"
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: TITLE_DELAY, ease: easing.emphasized }}
        >
          <img src={dazelkeyLockup} alt="DazelKey — Unlock Unlived Moments" className="opening-logo dazelkey-mark-inverted" />
        </motion.div>

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
