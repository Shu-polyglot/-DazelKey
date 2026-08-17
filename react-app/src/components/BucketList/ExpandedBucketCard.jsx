import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BucketStepEditor from '../Modals/BucketStepEditor';
import { getStatusLabel } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring, easing } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './ExpandedBucketCard.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easing.standard } },
  exit: { opacity: 0, transition: { duration: 0.32, ease: easing.exit } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 6, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.22, duration: 0.28, ease: easing.standard } },
  exit: { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.14, ease: easing.exit } },
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

function getMeta(bucket) {
  if (bucket.status === 'completed') {
    return bucket.completedDate ? formatDate(bucket.completedDate) : 'Completed';
  }
  if (bucket.dateType === 'someday') {
    return 'Someday';
  }
  return bucket.targetDate ? formatDate(bucket.targetDate) : 'Date to be chosen';
}

function ExpandedCardView({ bucket, onEdit, onDelete, onClose, onComplete }) {
  const [completeDate, setCompleteDate] = useState('');

  function handleComplete() {
    const chosenDate = bucket.dateType === 'someday' ? completeDate : bucket.targetDate;

    if (!chosenDate) {
      alert('Choose the date this experience happened.');
      return;
    }

    onComplete(bucket.id, chosenDate);
  }

  function handleDelete() {
    if (confirm('Delete this experience?\n\nThis action cannot be undone.')) {
      onDelete(bucket.id);
    }
  }

  return (
    <div className="expanded-card-view">
      <div className="expanded-card-top">
        <div className="expanded-card-eyebrow-row">
          <p className="bucket-category">{bucket.category}</p>
          <span className="bucket-status">{getStatusLabel(bucket)}</span>
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

      {bucket.status === 'completed' && <p className="archived-tag">In the Archive</p>}

      <h2 className="expanded-card-title">{bucket.title}</h2>
      <p className="expanded-card-meta">{getMeta(bucket)}</p>

      {bucket.description && <p className="expanded-card-description">{bucket.description}</p>}

      {(bucket.location || bucket.memory) && (
        <div className="expanded-card-notes">
          {bucket.location && (
            <p>
              <span className="expanded-card-note-label">Where</span>
              {bucket.location}
            </p>
          )}
          {bucket.memory && (
            <p>
              <span className="expanded-card-note-label">Memory</span>
              {bucket.memory}
            </p>
          )}
        </div>
      )}

      {bucket.status !== 'completed' && (
        <div className="achieve-prompt">
          <p className="achieve-prompt-label">Did you do it?</p>
          {bucket.dateType === 'someday' && (
            <label className="achieve-date-field">
              <span>When</span>
              <input type="date" value={completeDate} onChange={(event) => setCompleteDate(event.target.value)} />
            </label>
          )}
          <motion.button type="button" className="achieve-button" onClick={handleComplete} {...commitTapProps}>
            Mark it as done
          </motion.button>
        </div>
      )}

      <div className="expanded-card-actions detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onEdit} {...tapProps}>
          Edit
        </motion.button>
        <motion.button type="button" className="secondary-button" onClick={handleDelete} {...tapProps}>
          Delete
        </motion.button>
      </div>
    </div>
  );
}

/**
 * The shared-element counterpart to BucketCard: same layoutId, so closing
 * the grid card and mounting this in the same commit lets Motion project
 * the card's on-screen rect into the centered, expanded position (and
 * back again on close) instead of presenting a separate modal.
 */
function ExpandedBucketCard({ bucket, onClose, onUpdate, onDelete, onComplete }) {
  const [mode, setMode] = useState('view');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="expanded-card-overlay"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.article
        layoutId={`bucket-card-${bucket.id}`}
        className={`expanded-card${mode === 'edit' ? ' is-editing' : ''}`}
        data-status={getStatusLabel(bucket)}
        transition={{ layout: { duration: 0.6, ease: easing.emphasized } }}
      >
        <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
          {mode === 'edit' ? (
            <BucketStepEditor
              bucket={bucket}
              onCancel={() => setMode('view')}
              onSave={(patch) => {
                onUpdate(bucket.id, patch);
                setMode('view');
              }}
            />
          ) : (
            <ExpandedCardView
              bucket={bucket}
              onEdit={() => setMode('edit')}
              onDelete={onDelete}
              onClose={onClose}
              onComplete={onComplete}
            />
          )}
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export default ExpandedBucketCard;
