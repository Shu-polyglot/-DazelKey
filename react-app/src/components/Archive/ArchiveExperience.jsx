import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CinematicBackground from '../Onboarding/CinematicBackground';
import Story from './Story';
import StoryProgressBar from './StoryProgressBar';
import YearNav from './YearNav';
import ArchiveBridge from './ArchiveBridge';
import { getArchiveYears, buildYearStorySequence } from '../../lib/archive';
import { useStoryProgress } from '../../hooks/useStoryProgress';
import { easing } from '../../styles/motion';
import '../Onboarding/Onboarding.css';
import './Archive.css';
import './Story.css';

const LONG_PRESS_MS = 180;

/*
  Owns the whole Life Archive layer: which calendar year is selected, which
  Story within it is active, which direction it arrived from (for the
  dissolve-through transition), the auto-advance timer, and the final
  Now -> bridge hand-off. Rendered as a fixed overlay from App.jsx, the
  same shape as every other full-screen layer in this app (Onboarding, the
  Expanded Bucket Card) — no router.
*/
function ArchiveExperience({ buckets, closeMode, onClose, onReturnToDashboard, onExploreAhead }) {
  const years = useMemo(() => getArchiveYears(buckets), [buckets]);
  // This layer always remounts fresh on open (it has no BottomNav tab of
  // its own), so reading the newest year once at mount is enough --
  // opening the archive always starts closest to "now".
  const [selectedYear, setSelectedYear] = useState(() => years[0] ?? null);
  const stories = useMemo(() => buildYearStorySequence(buckets, selectedYear), [buckets, selectedYear]);
  const [[index, direction], setIndexState] = useState([0, 0]);
  const [showBridge, setShowBridge] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  const activeStory = stories[index];
  const isLastStory = index === stories.length - 1;

  function goTo(nextIndex, dir) {
    if (nextIndex < 0 || nextIndex >= stories.length) {
      return;
    }
    setIndexState([nextIndex, dir]);
  }

  // Jumping to a different year restarts that year's reel from its first
  // beat -- direction leans on the same forward/backward dissolve the
  // Next/Prev tap zones already use, biased by whether the newly chosen
  // year sits later or earlier than the one just left.
  function handleSelectYear(year) {
    if (year === selectedYear) {
      return;
    }
    const dir = selectedYear !== null && year < selectedYear ? -1 : 1;
    setSelectedYear(year);
    setIndexState([0, dir]);
  }

  const { progress, pause, resume } = useStoryProgress({
    storyKey: activeStory?.id,
    duration: activeStory?.duration,
    enabled: !showBridge && Boolean(activeStory) && activeStory.duration !== Infinity,
    onComplete: () => goTo(index + 1, 1),
  });

  function handleNext() {
    if (isLastStory) {
      setShowBridge(true);
      return;
    }
    goTo(index + 1, 1);
  }

  function handlePrev() {
    goTo(index - 1, -1);
  }

  // Explicit reset to the reel's first beat -- not a browser-history back,
  // just the same local index state every other navigation here already
  // drives, jumped straight to 0.
  function handleReturnToStart() {
    setIndexState([0, -1]);
  }

  function togglePause() {
    if (isLongPress.current) {
      resume();
    } else {
      pause();
    }
    isLongPress.current = !isLongPress.current;
  }

  function startLongPress() {
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      pause();
    }, LONG_PRESS_MS);
  }

  function endLongPress(navigate) {
    clearTimeout(longPressTimer.current);
    if (isLongPress.current) {
      isLongPress.current = false;
      resume();
      return;
    }
    navigate();
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (showBridge) {
        return;
      }
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === ' ') {
        event.preventDefault();
        togglePause();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, showBridge]);

  return (
    <motion.div
      className="archive-experience"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.15, ease: easing.emphasized } }}
      exit={{
        opacity: 0,
        scale: 1.04,
        filter: 'blur(16px)',
        transition: { duration: closeMode === 'complete' ? 0.75 : 0.45, ease: easing.exit },
      }}
    >
      <CinematicBackground />

      <button type="button" className="archive-close" aria-label="Close Life Archive" onClick={onClose}>
        ×
      </button>

      {!showBridge && <StoryProgressBar stories={stories} activeIndex={index} progress={progress} />}

      {!showBridge && years.length > 1 && (
        <YearNav years={years} selectedYear={selectedYear} onSelectYear={handleSelectYear} />
      )}

      <div className="archive-stage">
        <AnimatePresence custom={direction} initial={false}>
          {!showBridge && (
            <motion.div
              key={activeStory.id}
              className="story-frame"
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Story story={activeStory} onReturnToStart={handleReturnToStart} />
            </motion.div>
          )}
        </AnimatePresence>

        {!showBridge && (
          <>
            <button
              type="button"
              className="archive-tap-zone left"
              aria-label="Previous moment"
              onPointerDown={startLongPress}
              onPointerUp={() => endLongPress(handlePrev)}
              onPointerLeave={() => endLongPress(() => {})}
            />
            <button
              type="button"
              className="archive-tap-zone right"
              aria-label="Next moment"
              onPointerDown={startLongPress}
              onPointerUp={() => endLongPress(handleNext)}
              onPointerLeave={() => endLongPress(() => {})}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {showBridge && (
          <ArchiveBridge key="bridge" onReturnToDashboard={onReturnToDashboard} onExploreAhead={onExploreAhead} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ArchiveExperience;
