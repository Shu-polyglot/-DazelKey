import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { formatMoney } from '../../lib/doing';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

const QUICK_AMOUNTS = [1000, 5000, 10000];
const TAGS = [
  { value: 'earned', label: 'Earned' },
  { value: 'saved', label: 'Saved' },
];

/*
  A vote is one tap, once a day, self-judged -- "Add extra" is for
  everything else: a bonus, a sold item, a coffee skipped. Earned and
  Saved carry the exact same weight toward progress (see lib/doing.js);
  the tag only exists so the goal's detail view can separately surface
  "Saved so far" without changing what counts toward the ring.
*/
function DoingAddExtraModal({ goal, onAddExtra, onClose }) {
  const [amount, setAmount] = useState('');
  const [tag, setTag] = useState(null);

  const amountValid = Number(amount) > 0;

  function handleQuickAmount(value) {
    setAmount((prev) => String((Number(prev) || 0) + value));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!amountValid) {
      return;
    }
    onAddExtra(goal.id, Number(amount), tag);
    onClose();
  }

  return (
    <Modal onClose={onClose} className="doing-add-extra-modal">
      <div className="modal-header detail-header">
        <h3>Add extra</h3>
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

      <p className="trait-quiz-intro">Toward {goal.title}.</p>

      <div className="doing-quick-amounts">
        {QUICK_AMOUNTS.map((value) => (
          <motion.button
            key={value}
            type="button"
            className="step-editor-chip"
            onClick={() => handleQuickAmount(value)}
            whileHover={{ scale: 1.04, transition: spring.hover }}
            whileTap={{ scale: 0.92, transition: spring.press }}
          >
            +{formatMoney(value)}
          </motion.button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <label className="step-editor-field-label" htmlFor="extra-amount-input">
          <span className="sr-only">Amount</span>
          <input
            id="extra-amount-input"
            type="number"
            inputMode="numeric"
            min="1"
            className="step-editor-field-input"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Amount"
            autoFocus
          />
        </label>

        <div className="doing-tag-row" role="group" aria-label="Tag (optional)">
          {TAGS.map((option) => (
            <motion.button
              key={option.value}
              type="button"
              className={`step-editor-chip${tag === option.value ? ' is-active' : ''}`}
              onClick={() => setTag((prev) => (prev === option.value ? null : option.value))}
              whileHover={{ scale: 1.04, transition: spring.hover }}
              whileTap={{ scale: 0.92, transition: spring.press }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        <div className="modal-actions">
          <motion.button type="button" className="secondary-button" onClick={onClose} whileHover={{ y: -1, transition: spring.hover }} whileTap={{ y: 1, scale: 0.96, transition: spring.press }}>
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="primary-button"
            disabled={!amountValid}
            whileHover={amountValid ? { y: -2, transition: spring.hover } : undefined}
            whileTap={amountValid ? { y: 1, scale: 0.95, transition: spring.commit } : undefined}
          >
            Add
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

export default DoingAddExtraModal;
