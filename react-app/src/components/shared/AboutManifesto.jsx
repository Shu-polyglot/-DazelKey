import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { manifestoParagraphs } from '../../data/manifesto';
import { useNarration } from '../../hooks/useNarration';
import { easing } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.png';
import '../TransitionRitual.css';
import './AboutManifesto.css';

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

const paragraphVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: easing.emphasized } },
  exit: { opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.7, ease: easing.exit } },
};

// A speaker glyph in the app's own thin-stroke line style (see
// BottomNav's icon comment) -- the slash is what carries the muted read,
// same outline-only convention every other control here uses.
function SpeakerIcon({ muted }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M4 9.5V14.5H8L13 18.5V5.5L8 9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {muted ? (
        <path d="M16.5 9.5 L21 14.5 M21 9.5 L16.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path
          d="M16.5 9 C18 10.5 18 13.5 16.5 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/*
  Profile's "About DazelKey" entry point, opened as often as anyone
  likes -- reads the app's own design manifesto (data/manifesto) one
  paragraph at a time, narrated by useNarration, in the same full-screen
  cinematic shell TransitionRitual/MilestoneRitual already use (see the
  shared CSS import). Playback starts the moment this mounts, which only
  ever happens as the direct result of the "About DazelKey" tap in
  ProfilePage -- keeping SpeechSynthesis's first call inside that same
  user-gesture turn is what lets it actually play on browsers (notably
  Safari/iOS) that gate audio behind one.
*/
function AboutManifesto({ onClose }) {
  const { currentParagraph, index, isFinished, isMuted, start, stop, toggleMute } = useNarration(manifestoParagraphs);

  useEffect(() => {
    start();
    return stop;
    // start/stop are stable for the lifetime of this mount (see
    // useNarration) -- only ever want this to fire once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    stop();
    onClose();
  }

  return (
    <motion.div
      className="transition-ritual about-manifesto"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
    >
      <div className="about-manifesto-controls">
        <motion.button
          type="button"
          className="about-manifesto-control"
          aria-label={isMuted ? 'Unmute narration' : 'Mute narration'}
          aria-pressed={isMuted}
          onClick={toggleMute}
          whileTap={{ scale: 0.88 }}
        >
          <SpeakerIcon muted={isMuted} />
        </motion.button>
        <motion.button
          type="button"
          className="about-manifesto-control about-manifesto-close"
          onClick={handleClose}
          whileTap={{ scale: 0.92 }}
        >
          {isFinished ? 'Close' : 'Skip'}
        </motion.button>
      </div>

      <div className="transition-ritual-content">
        <img src={dazelkeyLockup} alt="DazelKey — Unlock Unlived Moments" className="about-manifesto-logo dazelkey-mark-inverted" />

        <AnimatePresence mode="wait">
          {currentParagraph && (
            <motion.p
              key={index}
              className="transition-ritual-quote about-manifesto-paragraph"
              variants={paragraphVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {currentParagraph}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default AboutManifesto;
