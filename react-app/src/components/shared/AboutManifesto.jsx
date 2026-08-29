import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { manifestoParagraphs } from '../../data/manifesto';
import { useNarration } from '../../hooks/useNarration';
import { easing } from '../../styles/motion';
import dazelkeyLockup from '../../assets/logo/dazelkey-lockup-full.webp';
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

// ---- About DazelKeyの中身を一時非表示 (temporary hide) ------------------
// The narrated manifesto (logo + paragraphs + mute control) is gated
// behind this flag rather than deleted, so it can come back with a
// one-line flip -- same convention as TopPrioritySection's own
// SHOW_PRIORITY_FEATURES flag. What replaced it as this screen's reason
// to exist: the Replay Tutorial entry point, moved in from ProfilePanel
// (see this component's own header comment below).
const SHOW_MANIFESTO_CONTENT = false;

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

  Also now hosts Replay Tutorial, moved in from ProfilePanel's header --
  About DazelKey is the more natural home for "learn how this app works"
  than the edit-profile form was.
*/
function AboutManifesto({ onClose, onReplayTutorial }) {
  const { currentParagraph, index, isFinished, isMuted, start, stop, toggleMute } = useNarration(manifestoParagraphs);

  useEffect(() => {
    if (!SHOW_MANIFESTO_CONTENT) {
      return undefined;
    }
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

  // Closes this full-screen shell first -- OnboardingTutorial is its own
  // full-screen overlay at the same z-index, so leaving this one open
  // behind it (the way ProfilePanel's plain modal used to) would just
  // have the two fight over which paints on top.
  function handleReplayTutorial() {
    stop();
    onClose();
    onReplayTutorial();
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
        {SHOW_MANIFESTO_CONTENT && (
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
        )}
        <motion.button
          type="button"
          className="about-manifesto-control about-manifesto-close"
          onClick={handleClose}
          whileTap={{ scale: 0.92 }}
        >
          {SHOW_MANIFESTO_CONTENT ? (isFinished ? 'Close' : 'Skip') : 'Close'}
        </motion.button>
      </div>

      <div className="transition-ritual-content">
        <img src={dazelkeyLockup} alt="DazelKey — Unlock Unlived Moments" className="about-manifesto-logo dazelkey-mark-inverted" />

        {SHOW_MANIFESTO_CONTENT && (
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
        )}

        <motion.button
          type="button"
          className="primary-button about-manifesto-replay-tutorial"
          onClick={handleReplayTutorial}
          whileHover={{ y: -1 }}
          whileTap={{ y: 1, scale: 0.97 }}
        >
          Replay Tutorial
        </motion.button>
      </div>
    </motion.div>
  );
}

export default AboutManifesto;
