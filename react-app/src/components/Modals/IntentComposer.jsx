import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './Modal';
import { allowedCategories } from '../../lib/buckets';
import { transitions, spring } from '../../styles/motion';
import './Modals.css';
import './IntentComposer.css';

const fieldVariants = {
  hidden: { opacity: 0, height: 0, y: -4, filter: 'blur(4px)', transition: transitions.exit },
  visible: { opacity: 1, height: 'auto', y: 0, filter: 'blur(0px)', transition: transitions.standard },
};

const toggleTap = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { scale: 0.94, transition: spring.press },
};

const chipTap = {
  whileHover: { scale: 1.04, transition: spring.hover },
  whileTap: { scale: 0.94, transition: spring.press },
};

function IntentComposer({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [targetDate, setTargetDate] = useState('');
  const [showCategory, setShowCategory] = useState(false);
  const [category, setCategory] = useState('Personal');
  const [showPlace, setShowPlace] = useState(false);
  const [location, setLocation] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [description, setDescription] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    onAdd({
      title: trimmedTitle,
      category,
      description: description.trim(),
      dateType: targetDate ? 'exact' : 'someday',
      targetDate: targetDate || null,
      location: location.trim(),
    });
    onClose();
  }

  return (
    <Modal onClose={onClose} className="composer-modal">
      <form className="composer" onSubmit={handleSubmit}>
        <p className="composer-prompt">What do you want to do?</p>
        <input
          type="text"
          className="composer-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Learn to surf in Bali"
          autoFocus
        />

        <div className="composer-toggles">
          {!showDate && (
            <motion.button type="button" className="composer-toggle" onClick={() => setShowDate(true)} {...toggleTap}>
              + Add a date
            </motion.button>
          )}
          {!showCategory && (
            <motion.button
              type="button"
              className="composer-toggle"
              onClick={() => setShowCategory(true)}
              {...toggleTap}
            >
              + Category
            </motion.button>
          )}
          {!showPlace && (
            <motion.button type="button" className="composer-toggle" onClick={() => setShowPlace(true)} {...toggleTap}>
              + Add a place
            </motion.button>
          )}
          {!showNote && (
            <motion.button type="button" className="composer-toggle" onClick={() => setShowNote(true)} {...toggleTap}>
              + Add a note
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showDate && (
            <motion.div
              key="date"
              className="composer-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="composer-field-label">When</span>
              <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} autoFocus />
            </motion.div>
          )}

          {showCategory && (
            <motion.div
              key="category"
              className="composer-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="composer-field-label">Category</span>
              <div className="composer-chip-row">
                {allowedCategories.map((cat) => (
                  <motion.button
                    key={cat}
                    type="button"
                    className={`composer-chip${category === cat ? ' is-active' : ''}`}
                    onClick={() => setCategory(cat)}
                    {...chipTap}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {showPlace && (
            <motion.div
              key="place"
              className="composer-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="composer-field-label">Where</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Bali"
                autoFocus
              />
            </motion.div>
          )}

          {showNote && (
            <motion.div
              key="note"
              className="composer-field"
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="composer-field-label">Note</span>
              <textarea
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A short note about this."
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="composer-actions">
          <motion.button
            type="button"
            className="secondary-button"
            onClick={onClose}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="primary-button composer-submit"
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
          >
            Add
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

export default IntentComposer;
