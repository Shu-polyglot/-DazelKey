import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BucketStepEditor from '../Modals/BucketStepEditor';
import CompletePrompt from '../shared/CompletePrompt';
import CompletedPhotoHero from '../shared/CompletedPhotoHero';
import { getStatusLabel, getWhenLabel, modeLabels } from '../../lib/buckets';
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

function getMeta(bucket) {
  if (bucket.status === 'completed') {
    return bucket.completedDate ? formatDate(bucket.completedDate) : 'Completed';
  }
  return getWhenLabel(bucket.when);
}

function ExpandedCardView({ bucket, onEdit, onDelete, onClose, onComplete, readOnly }) {
  const hasPhotoHero = bucket.status === 'completed' && Boolean(bucket.image);

  function handleDelete() {
    if (confirm('Delete this experience?\n\nThis action cannot be undone.')) {
      onDelete(bucket.id);
    }
  }

  return (
    <div className="expanded-card-view">
      <div className="expanded-card-top">
        <div className="expanded-card-eyebrow-row">
          <p className="bucket-category">{bucket.status === 'completed' ? 'Completed' : getWhenLabel(bucket.when)}</p>
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

      {hasPhotoHero ? (
        <CompletedPhotoHero bucket={bucket} />
      ) : (
        <>
          {bucket.status === 'completed' && <p className="archived-tag">In the Archive</p>}
          <h2 className="expanded-card-title">{bucket.title}</h2>
          <p className="expanded-card-meta">{getMeta(bucket)}</p>
        </>
      )}

      {bucket.message && <p className="expanded-card-description">{bucket.message}</p>}

      <div className="expanded-card-notes">
        <p>
          <span className="expanded-card-note-label">Place</span>
          {bucket.place || 'Not set'}
        </p>
        <p>
          <span className="expanded-card-note-label">Mode</span>
          {modeLabels[bucket.mode]}
        </p>
      </div>

      {!readOnly && bucket.status !== 'completed' && <CompletePrompt bucketId={bucket.id} onComplete={onComplete} />}

      {!readOnly && (
        <div className="expanded-card-actions detail-actions">
          <motion.button type="button" className="secondary-button" onClick={onEdit} {...tapProps}>
            Edit
          </motion.button>
          <motion.button type="button" className="secondary-button" onClick={handleDelete} {...tapProps}>
            Delete
          </motion.button>
        </div>
      )}
    </div>
  );
}

/**
 * The shared-element counterpart to BucketCard: same layoutId, so closing
 * the grid card and mounting this in the same commit lets Motion project
 * the card's on-screen rect into the centered, expanded position (and
 * back again on close) instead of presenting a separate modal.
 */
function ExpandedBucketCard({ bucket, onClose, onUpdate, onDelete, onComplete, layoutId, readOnly = false }) {
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
        layoutId={layoutId || `bucket-card-${bucket.id}`}
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
              readOnly={readOnly}
            />
          )}
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export default ExpandedBucketCard;
