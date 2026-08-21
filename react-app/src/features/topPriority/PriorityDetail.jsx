import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import PriorityVoteGrid from './PriorityVoteGrid';
import { getVoteSummary } from '../../lib/votes';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

/*
  The full-history counterpart to the card's compact preview -- same
  PriorityVoteGrid, just without a maxWeeks cap, so it scrolls all the
  way back to the priority's own createdAt instead of only the most
  recent weeks. Also the one place both milestone kinds -- automatic
  thresholds and hand-marked custom ones -- show up together, oldest
  first, since neither the card nor the ritual itself keeps a running
  log.
*/
function PriorityDetail({ priority, votes, onClose, onSelectVote }) {
  const summary = getVoteSummary(votes, priority.createdAt);
  const milestoneVotes = votes.filter((vote) => vote.isMilestone).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Modal onClose={onClose} className="detail-modal priority-detail-modal">
      <div className="modal-header detail-header">
        <div>
          <h3>{priority.title}</h3>
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

      <div className="priority-count priority-detail-count">
        <span className="priority-count-number">{votes.length}</span>
        <span className="priority-count-label">{votes.length === 1 ? 'vote' : 'votes'}</span>
      </div>

      <p className="priority-summary">
        {summary.voted} of the last {summary.total} day{summary.total === 1 ? '' : 's'}
      </p>
      <PriorityVoteGrid votes={votes} createdAt={priority.createdAt} onSelectVote={onSelectVote} />

      {milestoneVotes.length > 0 && (
        <div className="priority-milestone-list">
          <p className="priority-milestone-mark-label">Milestones</p>
          {milestoneVotes.map((vote) => (
            <div className="priority-milestone-item" key={vote.id}>
              <span>{vote.milestoneLabel}</span>
              <span className="priority-milestone-item-date">{formatDate(vote.date)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default PriorityDetail;
