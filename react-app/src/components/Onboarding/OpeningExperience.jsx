import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import WelcomeStep from './WelcomeStep';
import NameStep from './NameStep';
import AgeStep from './AgeStep';
import PhotoStep from './PhotoStep';
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
 * Orchestrates the pre-dashboard flow: Welcome always shows on every open.
 * If the profile is already complete, Enter goes straight to the dashboard.
 * Otherwise Enter continues into Name -> Age -> Photo, which together
 * complete the profile. A static black background (.opening-experience's
 * own --color-bg) carries across every step -- no video here (see
 * CinematicBackground, still used by the Life Archive experiences it was
 * built for, just not this one).
 */
function OpeningExperience({ profile, onComplete }) {
  const [step, setStep] = useState('welcome');
  const [draft, setDraft] = useState({ name: profile?.name || '', age: profile?.age ?? '', photo: profile?.photo ?? null });

  function handleEnter() {
    if (profile?.completed) {
      onComplete(null);
      return;
    }
    setStep('name');
  }

  function handleName(name) {
    setDraft((prev) => ({ ...prev, name }));
    setStep('age');
  }

  function handleAge(age) {
    setDraft((prev) => ({ ...prev, age }));
    setStep('photo');
  }

  function handlePhoto(photo) {
    const finalDraft = { ...draft, photo };
    setDraft(finalDraft);
    onComplete(finalDraft);
  }

  return (
    <motion.div
      className="opening-experience"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={experienceVariants}
    >
      <AnimatePresence mode="wait">
        {step === 'welcome' && <WelcomeStep key="welcome" onEnter={handleEnter} />}
        {step === 'name' && <NameStep key="name" initialValue={draft.name} onSubmit={handleName} />}
        {step === 'age' && <AgeStep key="age" initialValue={draft.age} onSubmit={handleAge} />}
        {step === 'photo' && <PhotoStep key="photo" initialValue={draft.photo} onSubmit={handlePhoto} />}
      </AnimatePresence>
    </motion.div>
  );
}

export default OpeningExperience;
