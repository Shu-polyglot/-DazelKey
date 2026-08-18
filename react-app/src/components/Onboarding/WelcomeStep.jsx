import { useMemo } from 'react';
import { motion } from 'motion/react';
import { spring, easing, transitions } from '../../styles/motion';
import OpeningAchievementCard from './OpeningAchievementCard';
import { pickOpeningAchievements, buildOpeningComposition } from '../../data/openingSequence';

const sequenceVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

// Top-row cards drift down into place, bottom-row cards drift up, and the
// two mid-row cards drift gently upward like the rest -- small enough to
// read as "settling" rather than as motion.
function entryOffsetFor(position) {
  if (position.startsWith('top')) return -14;
  if (position.startsWith('bottom')) return 14;
  return 10;
}

/**
 * The opening beat of Life OS: the sea/sun backdrop keeps rolling while
 * the user's own completed, photographed buckets fade into their own
 * corner of the frame one at a time, on a deliberately slow clock
 * (~9-10s, paced by ../../data/openingSequence.js regardless of how many
 * cards there are). With no photographed achievements yet, the sequence
 * still runs -- backdrop, then straight to the title -- rather than
 * showing placeholders. The exact center of the screen is left empty
 * until last, when the title and Enter land there as the one thing the
 * whole sequence was resolving toward.
 */
function WelcomeStep({ onEnter, buckets = [] }) {
  const achievements = useMemo(() => pickOpeningAchievements(buckets), [buckets]);
  const composition = useMemo(() => buildOpeningComposition(achievements.length), [achievements.length]);

  return (
    <motion.div
      className="opening-sequence"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={sequenceVariants}
    >
      {achievements.map((achievement, index) => {
        const card = composition.cards[index];
        return (
          <div key={achievement.id} className={`opening-anchor opening-anchor--${card.position}`}>
            <motion.div
              initial={{ opacity: 0, y: entryOffsetFor(card.position), scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: card.opacity, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: card.duration, delay: card.delay, ease: easing.emphasized }}
            >
              <OpeningAchievementCard image={achievement.image} caption={achievement.caption} size={card.size} />
            </motion.div>
          </div>
        );
      })}

      <div className="opening-finale">
        <motion.h1
          className="opening-title"
          initial={{ opacity: 0, y: 14, scale: 0.97, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: composition.titleDelay, ease: easing.emphasized }}
        >
          Life OS
        </motion.h1>

        <motion.button
          type="button"
          className="opening-cta"
          onClick={onEnter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: composition.ctaDelay, ease: easing.emphasized }}
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
