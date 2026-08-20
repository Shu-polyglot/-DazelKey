import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import NextUpPanel from './components/NextUpPanel';
import AchievementsShelf from './components/Achievements/AchievementsShelf';
import CalendarPanel from './components/Calendar/CalendarPanel';
import BucketListPanel from './components/BucketList/BucketListPanel';
import ExploreFeed from './components/Explore/ExploreFeed';
import StrategyPage from './components/Strategy/StrategyPage';
import ProfilePage from './components/ProfilePage';
import BucketCreateModal from './components/Modals/BucketCreateModal';
import BucketDetailsModal from './components/Modals/BucketDetailsModal';
import ProfilePanel from './components/Modals/ProfilePanel';
import DMThreadModal from './components/Modals/DMThreadModal';
import OpeningExperience from './components/Onboarding/OpeningExperience';
import ArchiveExperience from './components/Archive/ArchiveExperience';
import WhatsAheadExperience from './components/Archive/WhatsAheadExperience';
import TransitionRitual from './components/TransitionRitual';
import MilestoneRitual from './components/Strategy/MilestoneRitual';
import BottomNav from './components/BottomNav';
import { useBuckets } from './hooks/useBuckets';
import { useProfile } from './hooks/useProfile';
import { useVotes } from './hooks/useVotes';
import { useContributions } from './hooks/useContributions';
import { useRoute } from './hooks/useRoute';
import { todayIso } from './lib/dates';
import { getTotalProgress } from './lib/doing';
import { transitions, easing } from './styles/motion';
import './App.css';

function App() {
  const { buckets, addBucket, updateBucket, deleteBucket, completeBucket } = useBuckets();
  const { profile, updateProfile, completeProfile } = useProfile();
  const { votes, castVote, markMilestone } = useVotes();
  const { contributions, addContribution } = useContributions();
  const [route, navigate] = useRoute();
  const [hasEntered, setHasEntered] = useState(false);
  const [showEntryRitual, setShowEntryRitual] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [detailsBucketId, setDetailsBucketId] = useState(null);
  const [dmRecipient, setDmRecipient] = useState(null);
  // { caption, variant: 'milestone' | 'completion' } | null -- one piece
  // of state drives MilestoneRitual for every trigger across both Strategy
  // sides (Becoming's vote-count/custom milestones, Doing's same plus its
  // own bigger "goal amount reached" moment).
  const [ritual, setRitual] = useState(null);
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
    setDmRecipient(null);
    navigate(nextRoute);
  }

  function closeStory(closeMode) {
    setArchiveCloseMode(closeMode);
    navigate('achievement');
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

  // Both Strategy vote actions can turn out to be a milestone -- an
  // auto-threshold hit here, a hand-marked custom one below -- and either
  // way the ritual just needs the goal's own commitment line to quote
  // back, not to know which kind of milestone this was.
  function handleCastVote(goalId) {
    const vote = castVote(goalId);
    if (vote?.isMilestone) {
      const goal = buckets.find((bucket) => bucket.id === goalId);
      setRitual(goal ? { caption: `Your ${goal.title} side.`, variant: 'milestone' } : null);
    }
  }

  function handleMarkMilestone(goalId, voteId, label) {
    const marked = markMilestone(voteId, label);
    if (marked) {
      const goal = buckets.find((bucket) => bucket.id === goalId);
      setRitual(goal ? { caption: `Your ${goal.title} side.`, variant: 'milestone' } : null);
    }
  }

  // Activating a trait *is* creating a Become Bucket -- no wizard, one
  // tap. A trait can only ever be active once; re-suggesting an
  // already-active one from a retaken quiz is a no-op here.
  function handleActivateTrait(trait) {
    const alreadyActive = buckets.some((bucket) => bucket.goalType === 'become' && bucket.title === trait);
    if (alreadyActive) {
      return;
    }
    addBucket({
      title: trait,
      goalType: 'become',
      commitment: trait,
      mode: 'solo',
      when: 'longTerm',
      message: '',
      customMilestones: [],
    });
  }

  // Fires once, the first time a Doing goal's progress reaches its
  // amount -- checked from the caller's own freshly-computed vote/
  // contribution arrays (not by reading `votes`/`contributions` back
  // out of state, which wouldn't reflect the action that just happened
  // yet). Returns whether it fired, so callers can skip the ordinary
  // milestone ritual in favor of this bigger one on the same tick.
  function checkDoingCompletion(goal, votesAfter, contributionsAfter) {
    if (!goal || goal.doingCompletedAt || !goal.doingGoalAmount) {
      return false;
    }
    const total = getTotalProgress(goal, votesAfter, contributionsAfter);
    if (total < goal.doingGoalAmount) {
      return false;
    }
    updateBucket(goal.id, { doingCompletedAt: todayIso() });
    setRitual({ caption: goal.title, variant: 'completion' });
    return true;
  }

  function handleCastDoingVote(goalId) {
    const vote = castVote(goalId);
    const goal = buckets.find((bucket) => bucket.id === goalId);
    if (!goal || !vote) {
      return;
    }
    const completed = checkDoingCompletion(goal, [...votes, vote], contributions);
    if (!completed && vote.isMilestone) {
      setRitual({ caption: goal.title, variant: 'milestone' });
    }
  }

  function handleAddDoingExtra(goalId, amount, tag) {
    const record = addContribution(goalId, amount, tag);
    const goal = buckets.find((bucket) => bucket.id === goalId);
    if (!goal || !record) {
      return;
    }
    checkDoingCompletion(goal, votes, [...contributions, record]);
  }

  function handleAddDoingGoal({ bucketId, goalAmount, unitAmount, checklist }) {
    updateBucket(bucketId, {
      doingEnabled: true,
      doingGoalAmount: goalAmount,
      doingUnitHistory: [{ amount: unitAmount, effectiveFrom: todayIso() }],
      doingChecklist: checklist,
      doingCompletedAt: null,
    });
  }

  // Regular (non-milestone) items just flip; a milestone item only
  // fires the ritual on the check-in transition, not on uncheck.
  function handleToggleChecklistItem(goalId, itemId) {
    const goal = buckets.find((bucket) => bucket.id === goalId);
    const item = goal?.doingChecklist.find((entry) => entry.id === itemId);
    if (!goal || !item) {
      return;
    }
    const nowDone = !item.done;
    updateBucket(goalId, {
      doingChecklist: goal.doingChecklist.map((entry) => (entry.id === itemId ? { ...entry, done: nowDone } : entry)),
    });
    if (nowDone && item.isMilestone) {
      setRitual({ caption: goal.title, variant: 'milestone' });
    }
  }

  // Appends rather than overwrites -- see lib/doing.js's
  // getUnitAmountForDate -- so every vote already cast keeps the
  // contribution it actually earned at the time.
  function handleUpdateDoingUnit(goalId, newAmount) {
    const goal = buckets.find((bucket) => bucket.id === goalId);
    if (!goal || !(newAmount > 0)) {
      return;
    }
    const today = todayIso();
    const history = goal.doingUnitHistory.filter((entry) => entry.effectiveFrom !== today);
    updateBucket(goalId, { doingUnitHistory: [...history, { amount: newAmount, effectiveFrom: today }] });
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

            <div className={`tab-page${route === 'strategy' ? ' is-active' : ''}`} aria-hidden={route !== 'strategy'}>
              <StrategyPage
                buckets={buckets}
                votes={votes}
                contributions={contributions}
                onCastVote={handleCastVote}
                onMarkMilestone={handleMarkMilestone}
                onActivateTrait={handleActivateTrait}
                onCastDoingVote={handleCastDoingVote}
                onAddDoingExtra={handleAddDoingExtra}
                onAddDoingGoal={handleAddDoingGoal}
                onToggleChecklistItem={handleToggleChecklistItem}
                onUpdateDoingUnit={handleUpdateDoingUnit}
              />
            </div>

            <div className={`tab-page${route === 'explore' ? ' is-active' : ''}`} aria-hidden={route !== 'explore'}>
              <ExploreFeed onOpenDM={setDmRecipient} />
            </div>

            <div className={`tab-page${route === 'achievement' ? ' is-active' : ''}`} aria-hidden={route !== 'achievement'}>
              <OverviewPanel buckets={buckets} onViewRemaining={handleViewRemainingBuckets} />
              <CalendarPanel buckets={buckets} onOpenBucket={setDetailsBucketId} />
              <AchievementsShelf
                buckets={buckets}
                onUpdate={updateBucket}
                onDelete={deleteBucket}
                onOpenStory={() => navigate('story')}
              />
            </div>

            <div className={`tab-page${route === 'profile' ? ' is-active' : ''}`} aria-hidden={route !== 'profile'}>
              <ProfilePage
                profile={profile}
                buckets={buckets}
                onUpdateBucket={updateBucket}
                onDeleteBucket={deleteBucket}
                onCompleteBucket={completeBucket}
                onEditProfile={() => setIsProfileOpen(true)}
              />
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
              {dmRecipient && (
                <DMThreadModal key="dm-thread" recipient={dmRecipient} onClose={() => setDmRecipient(null)} />
              )}
            </AnimatePresence>,
            document.body,
          )}

          {createPortal(
            <AnimatePresence>
              {ritual && (
                <MilestoneRitual
                  key="milestone-ritual"
                  caption={ritual.caption}
                  variant={ritual.variant}
                  onContinue={() => setRitual(null)}
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
                  buckets={buckets}
                  onActivateTrait={handleActivateTrait}
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

      {hasEntered && <BottomNav active={route} onNavigate={handleNavigate} profile={profile} />}
    </>
  );
}

export default App;
