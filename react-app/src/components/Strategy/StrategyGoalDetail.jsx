import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import VoteGrid from './VoteGrid';
import { getVoteSummary } from '../../lib/votes';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  The full-history counterpart to the card's compact preview -- same
  VoteGrid, just without a maxWeeks cap, so it scrolls all the way back to
  the goal's own createdAt instead of only the most recent weeks. Also the
  one place both milestone kinds -- automatic thresholds and hand-marked
  custom ones -- show up together, oldest first, since neither the card
  nor the ritual itself keeps a running log.
*/
function StrategyGoalDetail({ goal, votes, onClose }) {
  const summary = getVoteSummary(votes, goal.createdAt);
  const milestoneVotes = votes.filter((vote) => vote.isMilestone).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Modal onClose={onClose} className="detail-modal strategy-detail-modal">
      <div className="modal-header detail-header">
        <div>
          <h3>{goal.title}</h3>
        </div>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <div className="strategy-goal-count strategy-detail-count">
        <span className="strategy-goal-count-number">{votes.length}</span>
        <span className="strategy-goal-count-label">{votes.length === 1 ? 'vote' : 'votes'}</span>
      </div>

      <p className="strategy-goal-summary">
        {summary.voted} of the last {summary.total} day{summary.total === 1 ? '' : 's'}
      </p>
      <VoteGrid votes={votes} createdAt={goal.createdAt} />

      {milestoneVotes.length > 0 && (
        <div className="strategy-milestone-list">
          <p className="strategy-milestone-mark-label">Milestones</p>
          {milestoneVotes.map((vote) => (
            <div className="strategy-milestone-item" key={vote.id}>
              <span>{vote.milestoneLabel}</span>
              <span className="strategy-milestone-item-date">{formatDate(vote.date)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default StrategyGoalDetail;
