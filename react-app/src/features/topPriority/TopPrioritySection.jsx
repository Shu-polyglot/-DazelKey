import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import PriorityCard from './PriorityCard';
import PriorityDetail from './PriorityDetail';
import AddPriorityFlow from './AddPriorityFlow';
import VoteMomentPrompt from './VoteMomentPrompt';
import VoteMomentModal from './VoteMomentModal';
import MilestoneRitual from '../../components/shared/MilestoneRitual';
import { useVotes } from '../../hooks/useVotes';
import { useTopPriorities, VOTES_STORAGE_KEY, MAX_TOP_PRIORITIES } from './topPriority';
import { spring } from '../../styles/motion';
import './topPriority.css';

/*
  Core (formerly "Top 3 Priority"), end to end: its own data store, its
  own vote engine (reusing useVotes' logic against a dedicated storage
  key -- see topPriority.js), its own creation flow, its own milestone
  ritual. This component needs nothing handed down from Strategy to run
  standalone -- `<TopPrioritySection />` alone still gets the whole
  feature, list through celebration -- `onAddAchievement` is the one
  optional exception: pass useBuckets' addAchievement (see App.jsx) and
  a Core milestone also logs an Achievement, carrying over whatever
  photo/note that vote has (see logAchievement below); omit it and
  milestones still work, they just don't get shared anywhere. (Internal
  module/route names stay "topPriority"/"priority" on purpose -- only
  the user-facing label changed.)
*/
function TopPrioritySection({ onAddAchievement, readOnly = false }) {
  const { priorities, addPriority } = useTopPriorities();
  const { votes, castVote, markMilestone, attachVoteMedia } = useVotes(VOTES_STORAGE_KEY);

  const [expandedId, setExpandedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  // { caption, variant: 'milestone', pendingVoteId? } | null -- this
  // module's own ritual state, deliberately not shared with Realize's
  // (see App.jsx) since Top 3 Priority is meant to run independent of
  // Strategy entirely. `pendingVoteId` is only set when the ritual is
  // standing in front of a *fresh* vote (see handleCastVote) -- that's
  // what tells handleRitualContinue whether to chain into the photo/note
  // prompt once the ritual closes.
  const [ritual, setRitual] = useState(null);
  // Id of a just-cast vote still waiting on the optional photo/note
  // prompt (VoteMomentPrompt) -- set the moment a vote lands (after any
  // milestone ritual for it has run its course), cleared once the user
  // saves or skips.
  const [pendingVoteId, setPendingVoteId] = useState(null);
  // { priorityId, priorityTitle, milestoneLabel } | null -- set
  // alongside `ritual` exactly when the vote that triggered it is a
  // fresh, auto-thresholded milestone (see handleCastVote), so the
  // Achievement this milestone becomes isn't logged until the photo/note
  // prompt above has actually resolved -- otherwise it'd be logged
  // without whatever photo the user was about to attach.
  const [pendingMilestone, setPendingMilestone] = useState(null);
  // The vote a grid cell was tapped open into (VoteMomentModal) -- only
  // ever set for a vote that actually has a photo/comment attached (see
  // PriorityVoteGrid's onSelectVote).
  const [selectedVote, setSelectedVote] = useState(null);

  const atCap = priorities.length >= MAX_TOP_PRIORITIES;
  const expanded = priorities.find((priority) => priority.id === expandedId) || null;

  function handleCastVote(priorityId) {
    const vote = castVote(priorityId);
    if (!vote) {
      return;
    }
    const priority = priorities.find((p) => p.id === priorityId);
    if (vote.isMilestone) {
      setRitual(priority ? { caption: priority.title, variant: 'milestone', pendingVoteId: vote.id } : null);
      setPendingMilestone(
        priority ? { priorityId, priorityTitle: priority.title, milestoneLabel: vote.milestoneLabel } : null,
      );
    } else {
      setPendingVoteId(vote.id);
    }
  }

  function handleMarkMilestone(priorityId, voteId, label) {
    const marked = markMilestone(voteId, label);
    if (marked) {
      const priority = priorities.find((p) => p.id === priorityId);
      // No pendingVoteId here -- this marks a vote that was already dealt
      // with (photo/note prompt already shown or skipped) at cast time,
      // so there's no prompt to wait on -- log the Achievement right
      // away, off whatever photo/comment that vote already carries.
      setRitual(priority ? { caption: priority.title, variant: 'milestone' } : null);
      const vote = votes.find((v) => v.id === voteId);
      logAchievement({ priorityId, priorityTitle: priority?.title, milestoneLabel: label }, vote?.photoUrl, vote?.comment);
    }
  }

  function handleRitualContinue() {
    const nextPendingVoteId = ritual?.pendingVoteId || null;
    setRitual(null);
    if (nextPendingVoteId) {
      setPendingVoteId(nextPendingVoteId);
    }
  }

  // Shared by both VoteMomentPrompt outcomes (Save and Skip) -- whichever
  // it was, the vote's photo/note state is now final, so this is the
  // right moment to log the Achievement a pending milestone was waiting
  // on (see pendingMilestone above).
  function finishVoteMoment(photoUrl, comment) {
    if (pendingMilestone) {
      logAchievement(pendingMilestone, photoUrl, comment);
      setPendingMilestone(null);
    }
    setPendingVoteId(null);
  }

  function handleSaveVoteMoment({ photoUrl, comment }) {
    if (pendingVoteId && (photoUrl || comment)) {
      attachVoteMedia(pendingVoteId, { photoUrl, comment });
    }
    finishVoteMoment(photoUrl, comment);
  }

  function handleSkipVoteMoment() {
    finishVoteMoment(null, null);
  }

  // Mirrors how Realize logs a Doing goal's own milestone/completion
  // moments (see App.jsx's checkDoingCompletion/handleToggleChecklistItem)
  // -- lands in the same Achievement store via the same addAchievement,
  // just translating this module's own vote fields (photoUrl/comment)
  // into that call's (photo/message) shape. A no-op with no
  // `onAddAchievement` (see this module's own header comment) -- Core
  // still works standalone, it just doesn't share milestones anywhere.
  function logAchievement(milestone, photoUrl, comment) {
    if (!onAddAchievement || !milestone?.priorityTitle) {
      return;
    }
    onAddAchievement(`${milestone.priorityTitle} — ${milestone.milestoneLabel || 'milestone'}`, photoUrl || null, {
      source: 'top-priority',
      sourceType: 'milestone',
      sourceGoalId: milestone.priorityId,
      message: comment || '',
    });
  }

  function handleAdd({ commitment, customMilestones }) {
    const record = addPriority({ title: commitment, customMilestones });
    if (record) {
      setIsAddOpen(false);
    }
  }

  return (
    <>
      {priorities.length === 0 ? (
        <div className="priority-empty">
          {readOnly
            ? 'Nothing here yet.'
            : "Write your first priority below to start voting for who you're becoming."}
        </div>
      ) : (
        <div className="priority-list">
          {priorities.map((priority) => (
            <PriorityCard
              key={priority.id}
              priority={priority}
              votes={votes}
              onCastVote={handleCastVote}
              onMarkMilestone={handleMarkMilestone}
              onOpen={() => setExpandedId(priority.id)}
              onSelectVote={setSelectedVote}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {!readOnly &&
        (atCap ? (
          <p className="priority-limit-note">
            You're focusing on {MAX_TOP_PRIORITIES} at a time -- complete or remove one to add another.
          </p>
        ) : (
          <motion.button
            type="button"
            className="secondary-button priority-add-button"
            onClick={() => setIsAddOpen(true)}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
          >
            + Add a Priority
          </motion.button>
        ))}

      {createPortal(
        <AnimatePresence>
          {expanded && (
            <PriorityDetail
              key={expanded.id}
              priority={expanded}
              votes={votes.filter((vote) => vote.goalId === expanded.id)}
              onClose={() => setExpandedId(null)}
              onSelectVote={setSelectedVote}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {selectedVote && <VoteMomentModal key="vote-moment" vote={selectedVote} onClose={() => setSelectedVote(null)} />}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {pendingVoteId && (
            <VoteMomentPrompt key="vote-moment-prompt" onSave={handleSaveVoteMoment} onSkip={handleSkipVoteMoment} />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isAddOpen && <AddPriorityFlow key="add-priority" onSave={handleAdd} onClose={() => setIsAddOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {ritual && (
            <MilestoneRitual key="priority-ritual" caption={ritual.caption} variant={ritual.variant} onContinue={handleRitualContinue} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export default TopPrioritySection;
