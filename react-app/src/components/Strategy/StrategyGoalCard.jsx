import { useMemo } from 'react';
import { motion } from 'motion/react';
import VoteGrid from './VoteGrid';
import { todayIso } from '../../lib/dates';
import { getVoteSummary } from '../../lib/votes';
import { getDimensionForTrait, traitSidePhrase } from '../../data/traits';
import { spring } from '../../styles/motion';
import '../Modals/BucketStepEditor.css';

const COMPACT_WEEKS = 10;

/*
  A Become goal's title is always exactly a trait name (see
  lib/buckets.js) -- the card's headline is that trait itself, with its
  dimension as a small eyebrow above it, and the vote button always reads
  "Cast a vote for your <trait> side." rather than quoting a stored
  sentence. Total votes is the one number this card foregrounds -- no
  streak, no percentage sharing the spotlight (see the requirements this
  was built against: emotional reward over metric accuracy).
*/
function StrategyGoalCard({ goal, votes, onCastVote, onMarkMilestone, onOpen }) {
  const goalVotes = useMemo(() => votes.filter((vote) => vote.goalId === goal.id), [votes, goal.id]);
  const totalVotes = goalVotes.length;
  const todaysVote = useMemo(() => goalVotes.find((vote) => vote.date === todayIso()) || null, [goalVotes]);
  const votedToday = Boolean(todaysVote);
  const summary = useMemo(() => getVoteSummary(goalVotes, goal.createdAt), [goalVotes, goal.createdAt]);
  const dimension = getDimensionForTrait(goal.title);

  // Today's vote can be hand-marked against one of the goal's own
  // milestones, but only until it's already special some other way (an
  // auto-threshold hit, or already marked) -- one milestone reason per
  // vote, so the chips disappear once that's settled for today.
  const canMarkMilestone = votedToday && !todaysVote.isMilestone && goal.customMilestones.length > 0;

  return (
    <article className="strategy-goal-card">
      <div className="strategy-goal-tap-area" onClick={onOpen}>
        {dimension && <span className="strategy-goal-dimension">{dimension}</span>}
        <p className="strategy-goal-commitment">{goal.title}</p>

        <p className="strategy-goal-summary">
          {summary.voted} of the last {summary.total} day{summary.total === 1 ? '' : 's'}
        </p>
        <VoteGrid votes={goalVotes} createdAt={goal.createdAt} maxWeeks={COMPACT_WEEKS} />
      </div>

      <div className="strategy-goal-footer">
        <div className="strategy-goal-count">
          <span className="strategy-goal-count-number">{totalVotes}</span>
          <span className="strategy-goal-count-label">{totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>

        <motion.button
          type="button"
          className={`primary-button strategy-vote-button${votedToday ? ' is-voted' : ''}`}
          onClick={() => onCastVote(goal.id)}
          disabled={votedToday}
          whileHover={votedToday ? undefined : { y: -1, transition: spring.hover }}
          whileTap={votedToday ? undefined : { y: 1, scale: 0.97, transition: spring.press }}
        >
          {votedToday ? 'Voted today' : `Cast a vote for ${traitSidePhrase(goal.title)}.`}
        </motion.button>
      </div>

      {canMarkMilestone && (
        <div className="strategy-milestone-mark">
          <p className="strategy-milestone-mark-label">Was today one of these?</p>
          <div className="step-editor-chip-row">
            {goal.customMilestones.map((milestone) => (
              <motion.button
                key={milestone}
                type="button"
                className="step-editor-chip"
                onClick={() => onMarkMilestone(goal.id, todaysVote.id, milestone)}
                whileHover={{ scale: 1.04, transition: spring.hover }}
                whileTap={{ scale: 0.92, transition: spring.press }}
              >
                {milestone}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {votedToday && todaysVote.isMilestone && (
        <p className="strategy-milestone-marked">
          ★ Marked as a milestone{todaysVote.milestoneLabel ? `: ${todaysVote.milestoneLabel}` : ''}
        </p>
      )}
    </article>
  );
}

export default StrategyGoalCard;
