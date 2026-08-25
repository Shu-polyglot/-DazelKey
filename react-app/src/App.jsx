import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import OverviewPanel from './components/OverviewPanel';
import AchievementsShelf from './components/Achievements/AchievementsShelf';
import CalendarPanel from './components/Calendar/CalendarPanel';
import ExploreFeed from './components/Explore/ExploreFeed';
import StrategyPage from './components/Strategy/StrategyPage';
import TopPrioritySection from './features/topPriority/TopPrioritySection';
import ProfilePage from './components/ProfilePage';
import BucketCreateModal from './components/Modals/BucketCreateModal';
import BucketDetailsModal from './components/Modals/BucketDetailsModal';
import ProfilePanel from './components/Modals/ProfilePanel';
import DMThreadModal from './components/Modals/DMThreadModal';
import OpeningExperience from './components/Onboarding/OpeningExperience';
import AchievementBanner from './components/Onboarding/AchievementBanner';
import OnboardingTutorial from './components/Onboarding/OnboardingTutorial';
import ArchiveExperience from './components/Archive/ArchiveExperience';
import WhatsAheadExperience from './components/Archive/WhatsAheadExperience';
import TransitionRitual from './components/TransitionRitual';
import MilestoneRitual from './components/shared/MilestoneRitual';
import CompleteScreen from './components/shared/CompleteScreen';
import AchievementPhotoPrompt from './components/Achievements/AchievementPhotoPrompt';
import BottomNav from './components/BottomNav';
import { useBuckets } from './hooks/useBuckets';
import { useProfile } from './hooks/useProfile';
import { useOnboardingTutorial } from './hooks/useOnboardingTutorial';
import { useVotes } from './hooks/useVotes';
import { useContributions } from './hooks/useContributions';
import { useRoute } from './hooks/useRoute';
import { todayIso } from './lib/dates';
import { getTotalProgress } from './lib/doing';
import { MAX_DOING_GOALS } from './lib/buckets';
import { hasOpeningAchievements } from './data/openingSequence';
import { transitions, easing } from './styles/motion';
import './App.css';

function App() {
  const { buckets, addBucket, updateBucket, deleteBucket, completeBucket, addAchievement } = useBuckets();
  const { profile, updateProfile, completeProfile } = useProfile();
  const { hasSeenTutorial, markTutorialSeen } = useOnboardingTutorial();
  // Realize's own legacy read: nothing writes new votes here anymore (the
  // per-card daily vote was retired in favor of Log Money), but a goal
  // that already had some keeps what it earned -- see lib/doing.js.
  const { votes } = useVotes();
  const { contributions, addContribution } = useContributions();
  const [route, navigate] = useRoute();
  // Which of Momentum's two views (see StrategyPage) is showing --
  // lifted up here, not local to StrategyPage, so handleViewRemaining
  // Buckets/handleExploreAhead below can force it onto 'bucket-lists'
  // before navigating there, the same way they used to jump straight to
  // the old standalone Bucket Lists tab.
  const [momentumView, setMomentumView] = useState('bucket-lists');
  const [hasEntered, setHasEntered] = useState(false);
  const [showAchievementBanner, setShowAchievementBanner] = useState(false);
  const [showEntryRitual, setShowEntryRitual] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isReplayTutorialOpen, setIsReplayTutorialOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [detailsBucketId, setDetailsBucketId] = useState(null);
  const [dmRecipient, setDmRecipient] = useState(null);
  // { caption, variant: 'milestone' | 'completion', achievement? } | null
  // -- drives MilestoneRitual for Realize's two triggers: a flagged
  // checklist item going done, and its own bigger "goal amount reached"
  // moment. Top 3 Priority runs its own, separate ritual state entirely
  // (see features/topPriority/TopPrioritySection) rather than sharing
  // this one, since that module is meant to work independent of Strategy.
  // `achievement` ({ title, source, sourceType, sourceGoalId }) is only
  // ever set for the two Realize moments that are also meant to become an
  // Achievement entry (100% reached, or a flagged checklist item) -- its
  // presence, not the variant, is what tells handleRitualContinue whether
  // to chain into the photo prompt.
  const [ritual, setRitual] = useState(null);
  // The Achievement to log once the user's dealt with the photo prompt --
  // set the moment the ritual above finishes, cleared once addAchievement
  // has actually run.
  const [pendingAchievement, setPendingAchievement] = useState(null);
  // { achievement: {image, title, completedDate, place, message} } | null
  // -- drives CompleteScreen, the full-screen beat every Achievement-
  // generating completion lands on. Deliberately separate from
  // `ritual`/`pendingAchievement` above (MilestoneRitual's own takeover):
  // this fires either instead of that (a plain Bucket completion has no
  // ritual at all) or right after it closes (Realize's 100%-goal-reached
  // path), never replacing or altering that sequence.
  const [completeScreen, setCompleteScreen] = useState(null);
  const [archiveCloseMode, setArchiveCloseMode] = useState('cancel');
  const [isWhatsAheadOpen, setIsWhatsAheadOpen] = useState(false);
  const isStoryOpen = route === 'story';
  const isOverlayOpen = isStoryOpen || isWhatsAheadOpen;

  const detailsBucket = buckets.find((bucket) => bucket.id === detailsBucketId) || null;

  function handleOnboardingComplete(patch) {
    if (patch) {
      completeProfile(patch);
    }
    // A new user with no photographed achievements yet has nothing for
    // the banner to show -- skip straight to the quote card rather than
    // rendering an empty screen.
    if (hasOpeningAchievements(buckets)) {
      setShowAchievementBanner(true);
    } else {
      setShowEntryRitual(true);
    }
  }

  function handleAchievementBannerContinue() {
    setShowAchievementBanner(false);
    setShowEntryRitual(true);
  }

  // First-run tutorial slots in right after the quote card and before the
  // dashboard -- a returning user (hasSeenTutorial already true) skips
  // straight past it, same as the entry ritual before it skips the name/
  // age/photo steps for a completed profile.
  function handleEntryRitualContinue() {
    setShowEntryRitual(false);
    if (hasSeenTutorial) {
      setHasEntered(true);
    } else {
      setShowTutorial(true);
    }
  }

  function handleTutorialFinish() {
    markTutorialSeen();
    setShowTutorial(false);
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
  // tab -- switch to Momentum's Bucket Lists view (see momentumView
  // above; The Bucket List moved off its own tab and in there after the
  // Core/Bucket Lists swap), then scroll once that tab is actually
  // showing.
  function handleViewRemainingBuckets() {
    setMomentumView('bucket-lists');
    navigate('strategy');
    window.setTimeout(() => {
      document.getElementById('bucket-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }

  // The bridge's second option hands off to a different full-screen
  // experience rather than back to a tab, so it skips closeStory entirely.
  function handleExploreAhead() {
    setArchiveCloseMode('complete');
    setMomentumView('bucket-lists');
    navigate('strategy');
    setIsWhatsAheadOpen(true);
  }

  // Persists the Trait Quiz's scores to the profile the moment someone
  // finishes it (see ProfilePanel/TraitQuiz) -- independent of whatever
  // else is mid-edit in the surrounding profile form's Save/Cancel.
  function handleSaveTraitQuiz(scores) {
    updateProfile({ traitScores: scores, traitQuizTakenAt: todayIso() });
  }

  // Fires once, the first time a Doing goal's progress reaches its
  // amount -- checked from the caller's own freshly-computed vote/
  // contribution arrays (not by reading `votes`/`contributions` back
  // out of state, which wouldn't reflect the action that just happened
  // yet). Returns whether it fired, so callers can skip the ordinary
  // milestone ritual in favor of this bigger one on the same tick.
  // Setting `doingCompletedAt` is also what drops the goal out of
  // Strategy's active Doing list (see StrategyPage's doingGoals filter)
  // -- the goal itself is never deleted, just no longer "in progress".
  function checkDoingCompletion(goal, votesAfter, contributionsAfter) {
    if (!goal || goal.doingCompletedAt || !goal.doingGoalAmount) {
      return false;
    }
    const total = getTotalProgress(goal, votesAfter, contributionsAfter);
    if (total < goal.doingGoalAmount) {
      return false;
    }
    updateBucket(goal.id, { doingCompletedAt: todayIso() });
    setRitual({
      caption: goal.title,
      variant: 'completion',
      achievement: { title: `${goal.title} — goal reached`, source: 'strategy-doing', sourceType: 'goal', sourceGoalId: goal.id },
    });
    return true;
  }

  // Wraps completeBucket with the one side effect it doesn't own itself:
  // sending the user to CompleteScreen. A plain Bucket completion has no
  // ritual/takeover of its own (unlike Realize's two triggers below), so
  // this is the only celebration on this path.
  function handleCompleteBucket(id, chosenDate, photo) {
    const bucket = buckets.find((entry) => entry.id === id);
    completeBucket(id, chosenDate, photo);
    setCompleteScreen({
      achievement: {
        image: photo || bucket?.image || null,
        title: bucket?.title || '',
        completedDate: chosenDate,
        place: bucket?.place || '',
        message: bucket?.message || '',
      },
    });
  }

  // Realize's single money-logging action (see StrategyPage/LogMoneyFlow)
  // -- one contribution, tagged Earned/Saved or neither, toward one goal.
  function handleLogMoney(goalId, amount, tag) {
    const record = addContribution(goalId, amount, tag);
    const goal = buckets.find((bucket) => bucket.id === goalId);
    if (!goal || !record) {
      return;
    }
    checkDoingCompletion(goal, votes, [...contributions, record]);
  }

  // The cap is already enforced by StrategyPage hiding "+ Add a Goal" at
  // MAX_DOING_GOALS (eligibleBuckets itself doesn't shrink for it, since
  // it's a Doing-only limit); this is the safety net.
  function handleAddDoingGoal({ bucketId, goalAmount, checklist }) {
    const activeDoingCount = buckets.filter((bucket) => bucket.doingEnabled && !bucket.doingCompletedAt).length;
    if (activeDoingCount >= MAX_DOING_GOALS) {
      return;
    }
    updateBucket(bucketId, {
      doingEnabled: true,
      doingGoalAmount: goalAmount,
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
      setRitual({
        caption: goal.title,
        variant: 'milestone',
        achievement: { title: `${goal.title} — ${item.label}`, source: 'strategy-doing', sourceType: 'milestone', sourceGoalId: goal.id },
      });
    }
  }

  // Both of Realize's ritual triggers (checkDoingCompletion and the
  // flagged-checklist branch above) always attach an `achievement`, so
  // continuing here always chains into the photo prompt below.
  function handleRitualContinue() {
    const achievement = ritual?.achievement;
    setRitual(null);
    if (achievement) {
      setPendingAchievement(achievement);
    }
  }

  // `photo` is null on Skip -- addAchievement treats that exactly like
  // any other photo-less completed Bucket (see AchievementCard's
  // hasPhoto check), not a special case.
  function handleAchievementPhotoDone(photo) {
    if (pendingAchievement) {
      addAchievement(pendingAchievement.title, photo, pendingAchievement);
      // CompleteScreen only for the goal-reached moment (spec's second
      // trigger is specifically "a Doing goal hits 100%"), not the smaller
      // flagged-checklist-item milestone this same photo prompt also
      // serves.
      if (pendingAchievement.sourceType === 'goal') {
        setCompleteScreen({
          achievement: { image: photo, title: pendingAchievement.title, completedDate: todayIso() },
        });
      }
    }
    setPendingAchievement(null);
  }

  return (
    <>
      <AnimatePresence>
        {!hasEntered && !showAchievementBanner && !showEntryRitual && (
          <OpeningExperience key="onboarding" profile={profile} onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievementBanner && (
          <AchievementBanner key="achievement-banner" buckets={buckets} onContinue={handleAchievementBannerContinue} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEntryRitual && <TransitionRitual key="entry-ritual" onContinue={handleEntryRitualContinue} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <OnboardingTutorial key="onboarding-tutorial" onClose={handleTutorialFinish} />}
      </AnimatePresence>

      <AnimatePresence>
        {isReplayTutorialOpen && (
          <OnboardingTutorial key="replay-tutorial" onClose={() => setIsReplayTutorialOpen(false)} />
        )}
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
          <Header title="DazelKey" />

          <main className="tab-content">
            <div className={`tab-page${route === 'core' ? ' is-active' : ''}`} aria-hidden={route !== 'core'}>
              <TopPrioritySection variant="page" />
            </div>

            <div className={`tab-page${route === 'strategy' ? ' is-active' : ''}`} aria-hidden={route !== 'strategy'}>
              <StrategyPage
                buckets={buckets}
                votes={votes}
                contributions={contributions}
                onLogMoney={handleLogMoney}
                onAddDoingGoal={handleAddDoingGoal}
                onToggleChecklistItem={handleToggleChecklistItem}
                onUpdateBucket={updateBucket}
                onDeleteBucket={deleteBucket}
                onCompleteBucket={handleCompleteBucket}
                onAddBucket={() => setIsAddModalOpen(true)}
                activeView={momentumView}
                onViewChange={setMomentumView}
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
                onCompleteBucket={handleCompleteBucket}
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
                  onComplete={handleCompleteBucket}
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
                  onContinue={handleRitualContinue}
                />
              )}
            </AnimatePresence>,
            document.body,
          )}

          {createPortal(
            <AnimatePresence>
              {pendingAchievement && (
                <AchievementPhotoPrompt
                  key="achievement-photo-prompt"
                  title={pendingAchievement.title}
                  onDone={handleAchievementPhotoDone}
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
                  onSaveTraitQuiz={handleSaveTraitQuiz}
                  onClose={() => setIsProfileOpen(false)}
                  onSave={(patch) => {
                    updateProfile(patch);
                    setIsProfileOpen(false);
                  }}
                  onReplayTutorial={() => setIsReplayTutorialOpen(true)}
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
            onComplete={handleCompleteBucket}
          />
        )}
      </AnimatePresence>

      {hasEntered && <BottomNav active={route} onNavigate={handleNavigate} profile={profile} />}

      <AnimatePresence>
        {completeScreen && (
          <CompleteScreen
            key="complete-screen"
            achievement={completeScreen.achievement}
            onDone={() => setCompleteScreen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
