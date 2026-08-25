import { motion } from 'motion/react';
import { spring, easing, transitions } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.png';

const sequenceVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

const TITLE_DELAY = 0.6;
const CTA_DELAY = TITLE_DELAY + 1.4;

/*
  The lockup PNG (src/assets/logo) is one flat image -- icon on top,
  wordmark, tagline, top to bottom -- so a single top-down clip-path
  reveal naturally uncovers them in that exact order without needing
  three separately-cropped/aligned assets. The percentages below are
  where each section actually sits in that 1200-tall source (icon ends
  ~52%, wordmark ~73%, tagline 100%) -- see dazelkey-icon.png/
  dazelkey-lockup-compact.png's own crop bounds for where these numbers
  came from.
*/
const logoRevealTransition = {
  delay: TITLE_DELAY,
  duration: 1.5,
  times: [0, 0.55, 0.8, 1],
  ease: easing.emphasized,
};

/**
 * The opening beat of DazelKey: the sea/sun backdrop keeps rolling while
 * the logo reveals itself top-down (icon, then wordmark, then tagline),
 * with Enter following a beat behind it.
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
          <motion.img
            src={dazelkeyLockup}
            alt="DazelKey — Unlock Unlived Moments"
            className="opening-logo dazelkey-mark-inverted"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: ['inset(0 0 100% 0)', 'inset(0 0 48% 0)', 'inset(0 0 27% 0)', 'inset(0 0 0% 0)'] }}
            transition={logoRevealTransition}
          />
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
