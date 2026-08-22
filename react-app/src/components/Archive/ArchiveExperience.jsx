import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CinematicBackground from '../Onboarding/CinematicBackground';
import StoryCarousel from './StoryCarousel';
import YearNav from './YearNav';
import ArchiveBridge from './ArchiveBridge';
import { getArchiveYears, buildYearStorySequence } from '../../lib/archive';
import { easing } from '../../styles/motion';
import '../Onboarding/Onboarding.css';
import './Archive.css';
import './StoryCarousel.css';

/*
  Owns the whole Life Archive layer: which calendar year is selected, which
  Story within it is active (browsed manually via StoryCarousel's featured
  card + thumbnail stack -- there's no auto-advance timer here, this is a
  browse-at-your-own-pace carousel, not an Instagram-style story reel), and
  the final Now -> bridge hand-off. Rendered as a fixed overlay from
  App.jsx, the same shape as every other full-screen layer in this app
  (Onboarding, the Expanded Bucket Card) — no router.
*/
function ArchiveExperience({ buckets, closeMode, onClose, onReturnToDashboard, onExploreAhead }) {
  const years = useMemo(() => getArchiveYears(buckets), [buckets]);
  // This layer always remounts fresh on open (it has no BottomNav tab of
  // its own), so reading the newest year once at mount is enough --
  // opening the archive always starts closest to "now".
  const [selectedYear, setSelectedYear] = useState(() => years[0] ?? null);
  const stories = useMemo(() => buildYearStorySequence(buckets, selectedYear), [buckets, selectedYear]);
  const [index, setIndex] = useState(0);
  const [showBridge, setShowBridge] = useState(false);

  const isLastStory = index === stories.length - 1;

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= stories.length) {
      return;
    }
    setIndex(nextIndex);
  }

  // Jumping to a different year restarts that year's reel from its first
  // beat.
  function handleSelectYear(year) {
    if (year === selectedYear) {
      return;
    }
    setSelectedYear(year);
    setIndex(0);
  }

  function handleNext() {
    if (isLastStory) {
      setShowBridge(true);
      return;
    }
    goTo(index + 1);
  }

  function handlePrev() {
    goTo(index - 1);
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

      {!showBridge && years.length > 1 && (
        <YearNav years={years} selectedYear={selectedYear} onSelectYear={handleSelectYear} />
      )}

      {!showBridge && (
        <div className="archive-stage">
          <StoryCarousel stories={stories} activeIndex={index} onSelect={goTo} onNext={handleNext} onPrev={handlePrev} />
        </div>
      )}

      <AnimatePresence>
        {showBridge && (
          <ArchiveBridge key="bridge" onReturnToDashboard={onReturnToDashboard} onExploreAhead={onExploreAhead} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ArchiveExperience;
