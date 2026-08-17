import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CinematicBackground from './CinematicBackground';
import WelcomeStep from './WelcomeStep';
import AgeStep from './AgeStep';
import { easing } from '../../styles/motion';
import './Onboarding.css';

const experienceVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: easing.emphasized } },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(16px)',
    transition: { duration: 0.9, ease: easing.exit },
  },
};

/**
 * Orchestrates the pre-dashboard flow (Opening → Welcome → Age, more steps
 * to follow). Renders one persistent CinematicBackground so the world feels
 * continuous while foreground steps swap — the transition reads as forward
 * motion through the same scene rather than a hard screen change.
 */
function OpeningExperience({ onComplete }) {
  const [step, setStep] = useState('welcome');

  return (
    <motion.div
      className="opening-experience"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={experienceVariants}
    >
      <CinematicBackground />

      <AnimatePresence mode="wait">
        {step === 'welcome' && <WelcomeStep key="welcome" onEnter={() => setStep('age')} />}
        {step === 'age' && <AgeStep key="age" onSubmit={onComplete} />}
      </AnimatePresence>
    </motion.div>
  );
}

export default OpeningExperience;
