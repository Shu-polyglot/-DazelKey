import { useMemo } from 'react';
import { motion } from 'motion/react';
import PriorityVoteGrid from './PriorityVoteGrid';
import { todayIso } from '../../lib/dates';
import { getVoteSummary } from '../../lib/votes';
import { spring } from '../../styles/motion';
import './topPriority.css';

const COMPACT_WEEKS = 10;

/*
  A priority's title is the freeform identity-commitment sentence the
  user wrote at creation (see AddPriorityFlow) -- the card's headline is
  that sentence itself. Total votes is the one number this card
  foregrounds -- no streak, no percentage sharing the spotlight (see the
  requirements this was built against: emotional reward over metric
  accuracy).
*/
function PriorityCard({ priority, votes, onCastVote, onMarkMilestone, onOpen, onSelectVote, readOnly = false }) {
  const priorityVotes = useMemo(() => votes.filter((vote) => vote.goalId === priority.id), [votes, priority.id]);
  const totalVotes = priorityVotes.length;
  const todaysVote = useMemo(() => priorityVotes.find((vote) => vote.date === todayIso()) || null, [priorityVotes]);
  const votedToday = Boolean(todaysVote);
  const summary = useMemo(() => getVoteSummary(priorityVotes, priority.createdAt), [priorityVotes, priority.createdAt]);

  // Today's vote can be hand-marked against one of the priority's own
  // milestones, but only until it's already special some other way (an
  // auto-threshold hit, or already marked) -- one milestone reason per
  // vote, so the chips disappear once that's settled for today.
  const canMarkMilestone = !readOnly && votedToday && !todaysVote.isMilestone && priority.customMilestones.length > 0;

  return (
    <article className="priority-card">
      <div className="priority-tap-area" onClick={onOpen}>
        <p className="priority-commitment">{priority.title}</p>

        <p className="priority-summary">
          {summary.voted} of the last {summary.total} day{summary.total === 1 ? '' : 's'}
        </p>
        <PriorityVoteGrid
          votes={priorityVotes}
          createdAt={priority.createdAt}
          maxWeeks={COMPACT_WEEKS}
          onSelectVote={onSelectVote}
        />
      </div>

      <div className="priority-footer">
        <div className="priority-count">
          <span className="priority-count-number">{totalVotes}</span>
          <span className="priority-count-label">{totalVotes === 1 ? 'vote' : 'votes'}</span>
        </div>

        {!readOnly && (
          <motion.button
            type="button"
            className={`primary-button priority-vote-button${votedToday ? ' is-voted' : ''}`}
            onClick={() => onCastVote(priority.id)}
            disabled={votedToday}
            whileHover={votedToday ? undefined : { y: -1, transition: spring.hover }}
            whileTap={votedToday ? undefined : { y: 1, scale: 0.97, transition: spring.press }}
          >
            {votedToday ? 'Voted today' : 'Cast a vote for this.'}
          </motion.button>
        )}
      </div>

      {canMarkMilestone && (
        <div className="priority-milestone-mark">
          <p className="priority-milestone-mark-label">Was today one of these?</p>
          <div className="priority-milestone-chip-row">
            {priority.customMilestones.map((milestone) => (
              <motion.button
                key={milestone}
                type="button"
                className="priority-milestone-chip"
                onClick={() => onMarkMilestone(priority.id, todaysVote.id, milestone)}
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
        <p className="priority-milestone-marked">
          ★ Marked as a milestone{todaysVote.milestoneLabel ? `: ${todaysVote.milestoneLabel}` : ''}
        </p>
      )}
    </article>
  );
}

export default PriorityCard;
