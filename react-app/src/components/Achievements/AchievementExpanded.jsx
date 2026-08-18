import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import BucketStepEditor from '../Modals/BucketStepEditor';
import ShareModal from './ShareModal';
import { modeLabels } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring, easing } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './AchievementExpanded.css';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easing.standard } },
  exit: { opacity: 0, transition: { duration: 0.32, ease: easing.exit } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 0.26, duration: 0.34, ease: easing.standard } },
  exit: { opacity: 0, filter: 'blur(6px)', transition: { duration: 0.14, ease: easing.exit } },
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

function AchievementExpandedView({ bucket, index, onEdit, onDelete, onClose, onShare }) {
  const hasPhoto = Boolean(bucket.image);

  function handleDelete() {
    if (confirm('Delete this experience?\n\nThis action cannot be undone.')) {
      onDelete(bucket.id);
    }
  }

  return (
    <div className="achievement-expanded-view">
      <div className={`achievement-expanded-media${hasPhoto ? '' : ' is-gradient'}`}>
        {hasPhoto && <img src={bucket.image} alt="" className="achievement-expanded-photo" />}
        <div className="achievement-expanded-scrim" />

        <motion.button
          type="button"
          className="icon-button achievement-expanded-close"
          aria-label="Close"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>

        <div className="achievement-expanded-overlay-content">
          <span className="achievement-expanded-eyebrow">
            {modeLabels[bucket.mode]} · No. {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="achievement-expanded-title">{bucket.title}</h2>
          <div className="achievement-expanded-meta">
            {bucket.completedDate && <span>{formatDate(bucket.completedDate)}</span>}
            {bucket.place && <span>{bucket.place}</span>}
          </div>
        </div>
      </div>

      {bucket.message && <p className="achievement-expanded-message">“{bucket.message}”</p>}

      <div className="achievement-expanded-actions detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onShare} {...tapProps}>
          ↗ Share
        </motion.button>
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
 * The shared-element counterpart to AchievementCard: same layoutId, so
 * closing the shelf card and mounting this in the same commit lets Motion
 * project the card's on-screen rect into the near-fullscreen expanded
 * position (and back again on close) instead of presenting a detached
 * modal. A spring-driven layout transition (rather than the grid's eased
 * duration) is deliberate here -- this is the one "step into the memory"
 * moment in the product, so it gets the springier, more physical feel.
 */
function AchievementExpanded({ bucket, index, onClose, onUpdate, onDelete }) {
  const [mode, setMode] = useState('view');
  const [isShareOpen, setIsShareOpen] = useState(false);

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
      className="achievement-expanded-overlay"
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
        layoutId={`achievement-card-${bucket.id}`}
        className={`achievement-expanded${mode === 'edit' ? ' is-editing' : ''}`}
        transition={{ layout: spring.soft }}
      >
        <motion.div
          className="achievement-expanded-content"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
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
            <AchievementExpandedView
              bucket={bucket}
              index={index}
              onEdit={() => setMode('edit')}
              onDelete={onDelete}
              onClose={onClose}
              onShare={() => setIsShareOpen(true)}
            />
          )}
        </motion.div>
      </motion.article>

      <AnimatePresence>
        {isShareOpen && <ShareModal key="share-modal" bucket={bucket} onClose={() => setIsShareOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}

export default AchievementExpanded;
