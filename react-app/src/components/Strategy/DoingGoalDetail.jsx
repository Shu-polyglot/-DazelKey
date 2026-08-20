import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import VoteGrid from './VoteGrid';
import ProgressRing from './ProgressRing';
import { getVoteSummary } from '../../lib/votes';
import { formatDate } from '../../lib/dates';
import { getTotalProgress, getSavedTotal, getCurrentUnitAmount, formatMoney } from '../../lib/doing';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  The full-history counterpart to the card -- same VoteGrid component
  Becoming's own detail view uses (see StrategyGoalDetail), reading the
  exact same vote records. Money-specific additions: the ring context
  numbers, a Saved-so-far line, the checklist, and the one place the
  daily unit can be changed going forward.
*/
function DoingGoalDetail({ goal, votes, contributions, onToggleChecklistItem, onUpdateUnit, onClose }) {
  const [unitDraft, setUnitDraft] = useState('');
  const [isEditingUnit, setIsEditingUnit] = useState(false);

  const summary = getVoteSummary(votes, goal.createdAt);
  const total = getTotalProgress(goal, votes, contributions);
  const saved = getSavedTotal(goal, contributions);
  const unit = getCurrentUnitAmount(goal.doingUnitHistory);
  const milestoneVotes = votes.filter((vote) => vote.isMilestone).sort((a, b) => a.date.localeCompare(b.date));

  function handleUnitSave(event) {
    event.preventDefault();
    if (Number(unitDraft) > 0) {
      onUpdateUnit(goal.id, Number(unitDraft));
    }
    setIsEditingUnit(false);
    setUnitDraft('');
  }

  return (
    <Modal onClose={onClose} className="detail-modal strategy-detail-modal">
      <div className="modal-header detail-header">
        <h3>{goal.title}</h3>
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

      <div className="doing-detail-ring">
        <ProgressRing current={total} target={goal.doingGoalAmount} />
      </div>

      {saved > 0 && <p className="doing-saved-line">Saved so far: {formatMoney(saved)}</p>}

      <p className="strategy-goal-summary">
        {summary.voted} of the last {summary.total} day{summary.total === 1 ? '' : 's'}
      </p>
      <VoteGrid votes={votes} createdAt={goal.createdAt} />

      <div className="doing-unit-row">
        <span>Daily unit: {formatMoney(unit)}</span>
        {isEditingUnit ? (
          <form className="doing-unit-form" onSubmit={handleUnitSave}>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              className="doing-unit-input"
              value={unitDraft}
              onChange={(event) => setUnitDraft(event.target.value)}
              placeholder="New amount"
              autoFocus
            />
            <button type="submit" className="secondary-button">
              Save
            </button>
          </form>
        ) : (
          <button type="button" className="secondary-button" onClick={() => setIsEditingUnit(true)}>
            Change
          </button>
        )}
      </div>

      {goal.doingChecklist.length > 0 && (
        <div className="doing-checklist">
          {goal.doingChecklist.map((item) => (
            <label key={item.id} className={`doing-checklist-item${item.done ? ' is-done' : ''}`}>
              <input type="checkbox" checked={item.done} onChange={() => onToggleChecklistItem(goal.id, item.id)} />
              <span>{item.label}</span>
              {item.isMilestone && <span className="doing-checklist-star">★</span>}
            </label>
          ))}
        </div>
      )}

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

export default DoingGoalDetail;
