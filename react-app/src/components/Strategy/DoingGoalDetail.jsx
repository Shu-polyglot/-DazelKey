import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import ProgressRing from './ProgressRing';
import { getSavedTotal, formatMoney } from '../../lib/doing';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  The ring context numbers, a Saved-so-far line, and the checklist --
  everything money-shaped for one Realize goal. No vote grid, no daily-
  unit editor: both were retired when Log Money replaced the per-card
  daily vote (see StrategyPage/LogMoneyFlow) as the one place money gets
  logged. `total` is computed once by the caller (getTotalProgress).
*/
function DoingGoalDetail({ goal, total, contributions, onToggleChecklistItem, onClose }) {
  const saved = getSavedTotal(goal, contributions);

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
    </Modal>
  );
}

export default DoingGoalDetail;
