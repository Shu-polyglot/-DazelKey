import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import NextUpPanel from './components/NextUpPanel';
import AchievementsShelf from './components/Achievements/AchievementsShelf';
import AchievementGallery from './components/Achievements/AchievementGallery';
import CalendarPanel from './components/Calendar/CalendarPanel';
import BucketListPanel from './components/BucketList/BucketListPanel';
import ProfilePage from './components/ProfilePage';
import BucketCreateModal from './components/Modals/BucketCreateModal';
import BucketDetailsModal from './components/Modals/BucketDetailsModal';
import ProfilePanel from './components/Modals/ProfilePanel';
import OpeningExperience from './components/Onboarding/OpeningExperience';
import ArchiveExperience from './components/Archive/ArchiveExperience';
import WhatsAheadExperience from './components/Archive/WhatsAheadExperience';
import TransitionRitual from './components/TransitionRitual';
import BottomNav from './components/BottomNav';
import { useBuckets } from './hooks/useBuckets';
import { useProfile } from './hooks/useProfile';
import { useRoute } from './hooks/useRoute';
import { transitions, easing } from './styles/motion';
import './App.css';

function App() {
  const { buckets, addBucket, updateBucket, deleteBucket, completeBucket } = useBuckets();
  const { profile, updateProfile, completeProfile } = useProfile();
  const [route, navigate] = useRoute();
  const [hasEntered, setHasEntered] = useState(false);
  const [showEntryRitual, setShowEntryRitual] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [detailsBucketId, setDetailsBucketId] = useState(null);
  const [archiveCloseMode, setArchiveCloseMode] = useState('cancel');
  const [isWhatsAheadOpen, setIsWhatsAheadOpen] = useState(false);
  const isStoryOpen = route === 'story';
  const isOverlayOpen = isStoryOpen || isWhatsAheadOpen;

  const detailsBucket = buckets.find((bucket) => bucket.id === detailsBucketId) || null;

  function handleOnboardingComplete(patch) {
    if (patch) {
      completeProfile(patch);
    }
    setShowEntryRitual(true);
  }

  function handleEntryRitualContinue() {
    setShowEntryRitual(false);
    setHasEntered(true);
  }

  // Tab taps always win over whatever's currently on screen, so the nav
  // reliably delivers a single-tap jump to any destination regardless of
  // which overlay or modal happens to be open.
  function handleNavigate(nextRoute) {
    setIsWhatsAheadOpen(false);
    setIsAddModalOpen(false);
    setIsProfileOpen(false);
    setDetailsBucketId(null);
    navigate(nextRoute);
  }

  function closeStory(closeMode) {
    setArchiveCloseMode(closeMode);
    navigate('bucket-lists');
  }

  // OverviewPanel now lives at the top of The Achievement tab, so its
  // "remaining" link (from the archive progress modal) has to leave the
  // tab -- switch to The Bucket Lists, then scroll once that tab is
  // actually showing.
  function handleViewRemainingBuckets() {
    navigate('bucket-lists');
    window.setTimeout(() => {
      document.getElementById('bucket-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }

  // The bridge's second option hands off to a different full-screen
  // experience rather than back to a tab, so it skips closeStory entirely.
  function handleExploreAhead() {
    setArchiveCloseMode('complete');
    navigate('bucket-lists');
    setIsWhatsAheadOpen(true);
  }

  return (
    <>
      <AnimatePresence>
        {!hasEntered && !showEntryRitual && (
          <OpeningExperience key="onboarding" profile={profile} buckets={buckets} onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEntryRitual && <TransitionRitual key="entry-ritual" onContinue={handleEntryRitualContinue} />}
      </AnimatePresence>

      {hasEntered && (
        <motion.div
          className="page-shell"
          initial={{ opacity: 0, y: 12 }}
          animate={
            isOverlayOpen
              ? { opacity: 1, y: 0, scale: 0.97, filter: 'blur(16px)' }
              : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          }
          transition={isOverlayOpen ? { duration: 0.55, ease: easing.exit } : { duration: 0.5, ease: easing.emphasized }}
        >
          <Header
            title="Life OS"
            profile={profile}
            onAddBucket={() => setIsAddModalOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          <main className="tab-content">
            <div className={`tab-page${route === 'bucket-lists' ? ' is-active' : ''}`} aria-hidden={route !== 'bucket-lists'}>
              <NextUpPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />

              <BucketListPanel
                buckets={buckets}
                onUpdate={updateBucket}
                onDelete={deleteBucket}
                onComplete={completeBucket}
              />
            </div>

            <div className={`tab-page${route === 'achievement' ? ' is-active' : ''}`} aria-hidden={route !== 'achievement'}>
              <OverviewPanel
                buckets={buckets}
                onOpenArchive={() => navigate('story')}
                onViewRemaining={handleViewRemainingBuckets}
              />
              <CalendarPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
              <AchievementsShelf buckets={buckets} onUpdate={updateBucket} onDelete={deleteBucket} />
            </div>

            <div className={`tab-page${route === 'profile' ? ' is-active' : ''}`} aria-hidden={route !== 'profile'}>
              <ProfilePage profile={profile} onEditProfile={() => setIsProfileOpen(true)} />
              <AchievementGallery buckets={buckets} onUpdate={updateBucket} onDelete={deleteBucket} />
            </div>
          </main>

          {/* Portaled to document.body: page-shell's Motion-animated filter
              (see the WhatsAheadExperience comment for the full mechanics)
              traps position:fixed descendants into its own -- much taller
              -- content box instead of the viewport, which would center
              these dialogs somewhere off-screen and tuck their bottom
              actions under BottomNav. Portaling escapes that entirely. */}
          {createPortal(
            <AnimatePresence>
              {isAddModalOpen && (
                <BucketCreateModal key="add-modal" onClose={() => setIsAddModalOpen(false)} onAdd={addBucket} />
              )}
            </AnimatePresence>,
            document.body,
          )}

          {createPortal(
            <AnimatePresence>
              {detailsBucket && (
                <BucketDetailsModal
                  key={detailsBucket.id}
                  bucket={detailsBucket}
                  onClose={() => setDetailsBucketId(null)}
                  onComplete={completeBucket}
                />
              )}
            </AnimatePresence>,
            document.body,
          )}

          {createPortal(
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
            </AnimatePresence>,
            document.body,
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {isStoryOpen && (
          <ArchiveExperience
            key="archive"
            buckets={buckets}
            closeMode={archiveCloseMode}
            onClose={() => closeStory('cancel')}
            onReturnToDashboard={() => closeStory('complete')}
            onExploreAhead={handleExploreAhead}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWhatsAheadOpen && (
          <WhatsAheadExperience
            key="whats-ahead"
            buckets={buckets}
            onClose={() => setIsWhatsAheadOpen(false)}
            onComplete={completeBucket}
          />
        )}
      </AnimatePresence>

      {hasEntered && <BottomNav active={route} onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
