import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { formatDate } from '../../lib/dates';
import { formatMoney, getTotalProgress } from '../../lib/doing';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  Doesn't hold any data of its own -- these are the exact same
  Achievement entries useBuckets' addAchievement already wrote when a
  Doing goal hit 100% (see App.jsx's checkDoingCompletion), just filtered
  down to that one moment (source/sourceType, not the milestone-checkoff
  entries the same flow also produces) and re-sorted newest-first. Each
  row looks its origin goal back up by sourceGoalId -- never deleted,
  only dropped from Strategy's active Doing list once completed -- for
  the title and final amount, since neither is worth duplicating here.
*/
function DoingHistoryModal({ buckets, votes, contributions, onClose }) {
  const entries = buckets
    .filter((bucket) => bucket.source === 'strategy-doing' && bucket.sourceType === 'goal')
    .map((entry) => {
      const goal = buckets.find((bucket) => bucket.id === entry.sourceGoalId) || null;
      const doneMilestones = goal ? goal.doingChecklist.filter((item) => item.isMilestone && item.done).length : 0;
      const totalMilestones = goal ? goal.doingChecklist.filter((item) => item.isMilestone).length : 0;
      return {
        id: entry.id,
        date: entry.completedDate,
        title: goal ? goal.title : entry.title,
        amount: goal ? getTotalProgress(goal, votes, contributions) : null,
        doneMilestones,
        totalMilestones,
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <Modal onClose={onClose} className="detail-modal doing-history-modal">
      <div className="modal-header detail-header">
        <h3>Doing History</h3>
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

      {entries.length === 0 ? (
        <div className="strategy-empty">Goals you complete will show up here.</div>
      ) : (
        <div className="doing-history-list">
          {entries.map((entry) => (
            <div className="doing-history-item" key={entry.id}>
              <span className="doing-history-item-date">{formatDate(entry.date)}</span>
              <span className="doing-history-item-title">{entry.title}</span>
              <span className="doing-history-item-meta">
                {entry.amount != null && formatMoney(entry.amount)}
                {entry.totalMilestones > 0 && ` · ${entry.doneMilestones}/${entry.totalMilestones} milestones`}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default DoingHistoryModal;
