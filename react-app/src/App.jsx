import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import NextUpPanel from './components/NextUpPanel';
import AchievementsShelf from './components/Achievements/AchievementsShelf';
import CalendarPanel from './components/Calendar/CalendarPanel';
import BucketListPanel from './components/BucketList/BucketListPanel';
import BucketCreateModal from './components/Modals/BucketCreateModal';
import BucketDetailsModal from './components/Modals/BucketDetailsModal';
import ProfilePanel from './components/Modals/ProfilePanel';
import OpeningExperience from './components/Onboarding/OpeningExperience';
import ArchiveExperience from './components/Archive/ArchiveExperience';
import { useBuckets } from './hooks/useBuckets';
import { useProfile } from './hooks/useProfile';
import { transitions, easing } from './styles/motion';
import './App.css';

function App() {
  const { buckets, addBucket, updateBucket, deleteBucket, completeBucket } = useBuckets();
  const { profile, updateProfile, completeProfile } = useProfile();
  const [hasEntered, setHasEntered] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [detailsBucketId, setDetailsBucketId] = useState(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveCloseMode, setArchiveCloseMode] = useState('cancel');
  const [archiveScrollTarget, setArchiveScrollTarget] = useState(null);

  const detailsBucket = buckets.find((bucket) => bucket.id === detailsBucketId) || null;

  function handleOnboardingComplete(patch) {
    if (patch) {
      completeProfile(patch);
    }
    setHasEntered(true);
  }

  function closeArchive(closeMode, scrollTarget) {
    setArchiveCloseMode(closeMode);
    setArchiveScrollTarget(scrollTarget);
    setIsArchiveOpen(false);
  }

  // Scrolls once the Archive's exit transition has substantially settled,
  // so the destination section is already visible through the (by then)
  // sharp, unblurred Dashboard rather than mid-transition.
  useEffect(() => {
    if (isArchiveOpen || !archiveScrollTarget) {
      return undefined;
    }
    const target = archiveScrollTarget;
    setArchiveScrollTarget(null);
    const timer = setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 550);
    return () => clearTimeout(timer);
  }, [isArchiveOpen, archiveScrollTarget]);

  return (
    <>
      <AnimatePresence>
        {!hasEntered && (
          <OpeningExperience key="onboarding" profile={profile} onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {hasEntered && (
        <motion.div
          className="page-shell"
          initial={{ opacity: 0, y: 12 }}
          animate={
            isArchiveOpen
              ? { opacity: 1, y: 0, scale: 0.97, filter: 'blur(16px)' }
              : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          }
          transition={isArchiveOpen ? { duration: 0.55, ease: easing.exit } : { duration: 0.5, ease: easing.emphasized }}
        >
          <Header
            title="Life OS"
            profile={profile}
            onAddBucket={() => setIsAddModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          <main className="main-layout">
            <OverviewPanel buckets={buckets} onOpenArchive={() => setIsArchiveOpen(true)} />
            <NextUpPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
          </main>

          <AchievementsShelf buckets={buckets} onUpdate={updateBucket} onDelete={deleteBucket} />
          <CalendarPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
          <BucketListPanel
            buckets={buckets}
            onUpdate={updateBucket}
            onDelete={deleteBucket}
            onComplete={completeBucket}
          />

          <AnimatePresence>
            {isAddModalOpen && (
              <BucketCreateModal key="add-modal" onClose={() => setIsAddModalOpen(false)} onAdd={addBucket} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {detailsBucket && (
              <BucketDetailsModal
                key={detailsBucket.id}
                bucket={detailsBucket}
                onClose={() => setDetailsBucketId(null)}
                onUpdate={updateBucket}
                onDelete={(id) => {
                  deleteBucket(id);
                  setDetailsBucketId(null);
                }}
                onComplete={completeBucket}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isProfileOpen && (
              <ProfilePanel
                key="profile-panel"
                profile={profile}
                onClose={() => setIsProfileOpen(false)}
                onSave={(patch) => {
                  updateProfile(patch);
                  setIsProfileOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isArchiveOpen && (
          <ArchiveExperience
            key="archive"
            buckets={buckets}
            closeMode={archiveCloseMode}
            onClose={() => closeArchive('cancel', 'archive-section')}
            onReturnToDashboard={() => closeArchive('complete', 'archive-section')}
            onExploreAhead={() => closeArchive('complete', 'bucket-list-section')}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
