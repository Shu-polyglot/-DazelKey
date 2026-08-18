import { motion } from 'motion/react';
import Modal from './Modal';
import { spring } from '../../styles/motion';
import './ArchiveProgressModal.css';

/*
  The detail behind the Overview ring's percentage -- same completed/total
  numbers that already drive that ring, just spelled out. No parallel stat
  calculation lives here; `stats` is passed in from OverviewPanel as-is.
*/
function ArchiveProgressModal({ stats, onClose, onViewRemaining }) {
  const remaining = Math.max(stats.total - stats.completed, 0);

  return (
    <Modal onClose={onClose} className="detail-modal progress-modal">
      <div className="modal-header detail-header">
        <h3>Archive progress</h3>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close archive progress"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <div className="detail-content">
        <p className="progress-modal-fraction">
          {stats.completed} <span>/ {stats.total} experiences</span>
        </p>
        <p className="progress-modal-percentage">{stats.percentage}%</p>

        <div className="progress-modal-bar">
          <div className="progress-modal-bar-fill" style={{ width: `${stats.percentage}%` }} />
        </div>

        <div className="detail-meta">
          <div className="detail-item">
            <span className="label">Completed</span>
            <span className="value">{stats.completed}</span>
          </div>

          {remaining > 0 ? (
            <motion.button
              type="button"
              className="detail-item progress-modal-remaining"
              onClick={onViewRemaining}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
            >
              <span className="label">Remaining</span>
              <span className="value">{remaining} →</span>
            </motion.button>
          ) : (
            <div className="detail-item">
              <span className="label">Remaining</span>
              <span className="value">0</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ArchiveProgressModal;
