import { useLocalStorage } from './useLocalStorage';
import { todayIso } from '../lib/dates';

const DEFAULT_STORAGE_KEY = 'lifeos-votes-v1';

// Vote-count thresholds that automatically promote that day's vote to a
// milestone -- no thresholds beyond this list ever fire again for a goal,
// so the celebration stays a occasional, earned beat rather than routine.
export const AUTO_MILESTONE_THRESHOLDS = [10, 30, 100, 250, 500, 1000];

function autoMilestoneLabel(totalAfterThisVote) {
  return AUTO_MILESTONE_THRESHOLDS.includes(totalAfterThisVote) ? `${totalAfterThisVote} votes` : null;
}

/*
  One flat store for every Strategy vote, across every Become goal --
  mirrors useBuckets: called once (in App), the array and its mutator
  passed down, so every card reads/writes the same source instead of
  racing separate localStorage subscriptions.

  Both mutators below decide their result (was this a fresh vote? did the
  mark actually take?) by reading the `votes` state this hook already
  holds, *before* calling setVotes -- not by mutating a variable from
  inside the setState updater. React only guarantees an updater runs
  synchronously as an internal bail-out optimization, not as a supported
  way to read a result back out; relying on it intermittently returned
  stale results here.

  `isMilestone` (plus `milestoneLabel`) is carried on every vote from day
  one, always false/null until either the auto-threshold check below or a
  user's manual custom-milestone mark (`markMilestone`) flips it -- both
  just patch the existing vote record, no separate milestone store to
  keep in sync.

  `storageKey` defaults to Strategy's own vote store, but any feature
  that needs this exact same one-vote-per-day/milestone engine against
  its own goals -- Top 3 Priority, see src/features/topPriority -- can
  pass its own key instead of reinventing the logic.
*/
export function useVotes(storageKey = DEFAULT_STORAGE_KEY) {
  const [votes, setVotes] = useLocalStorage(storageKey, () => []);

  // One vote per goal per day -- the grid's one cell per day -- so this
  // is a no-op if today's vote for this goal already exists. Returns the
  // vote actually recorded (or null on a no-op) so the caller can react
  // to a fresh milestone -- e.g. trigger the celebration ritual -- without
  // this hook knowing anything about that UI.
  function castVote(goalId) {
    const date = todayIso();
    if (votes.some((vote) => vote.goalId === goalId && vote.date === date)) {
      return null;
    }

    const totalAfter = votes.filter((vote) => vote.goalId === goalId).length + 1;
    const milestoneLabel = autoMilestoneLabel(totalAfter);
    const vote = {
      id: `${goalId}-${date}`,
      goalId,
      date,
      isMilestone: Boolean(milestoneLabel),
      milestoneLabel: milestoneLabel || null,
    };

    setVotes((prev) => [...prev, vote]);
    return vote;
  }

  // Hand-marks an existing (necessarily today's, since only today's vote
  // button exposes this) vote against one of the goal's own custom
  // milestones. A no-op if that vote is already a milestone -- one
  // milestone reason per vote, first one wins -- so returns false rather
  // than silently relabeling it.
  function markMilestone(voteId, label) {
    const target = votes.find((vote) => vote.id === voteId);
    if (!target || target.isMilestone) {
      return false;
    }

    setVotes((prev) =>
      prev.map((vote) => (vote.id === voteId ? { ...vote, isMilestone: true, milestoneLabel: label } : vote)),
    );
    return true;
  }

  return { votes, castVote, markMilestone };
}
