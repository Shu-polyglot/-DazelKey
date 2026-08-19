import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ShareModal from './ShareModal';
import CameraCapture from '../shared/CameraCapture';
import { modeOptions, modeLabels } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl, supportsCamera } from '../../lib/photo';
import { spring, easing } from '../../styles/motion';
import '../Modals/Modals.css';
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
 * Edits the same card in place -- same photo hero, same title/meta
 * layout as the view above -- rather than handing off to the multi-step
 * Bucket wizard. Only what the card actually shows is editable (title,
 * mode, message); completedDate/place are set at achieve-time and aren't
 * displayed here even in view mode, so they stay untouched.
 */
function AchievementExpandedEdit({ bucket, index, onCancel, onSave }) {
  const [title, setTitle] = useState(bucket.title);
  const [mode, setMode] = useState(bucket.mode);
  const [message, setMessage] = useState(bucket.message || '');
  const [photo, setPhoto] = useState(bucket.image || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const hasPhoto = Boolean(photo);
  const titleEmpty = !title.trim();

  async function processPhotoFile(file) {
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    try {
      setPhoto(await resizeImageToDataUrl(file));
    } catch (error) {
      console.warn('Unable to process photo.', error);
      alert('Could not read that photo. Try a different file.');
    }
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    await processPhotoFile(file);
  }

  function handleCameraCapture(blob) {
    setIsCameraOpen(false);
    processPhotoFile(blob);
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    onSave({ title: trimmedTitle, mode, message: message.trim(), image: photo });
  }

  return (
    <div className="achievement-expanded-view">
      <div className={`achievement-expanded-media${hasPhoto ? '' : ' is-gradient'}`}>
        {hasPhoto && <img src={photo} alt="" className="achievement-expanded-photo" />}
        <div className="achievement-expanded-scrim" />

        <button
          type="button"
          className="achievement-expanded-photo-edit"
          onClick={() => fileInputRef.current?.click()}
          aria-label={hasPhoto ? 'Change photo' : 'Add photo'}
        >
          <span className="achievement-expanded-photo-edit-plus">+</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="achievement-expanded-photo-input"
        />

        {supportsCamera && (
          <button
            type="button"
            className="achievement-expanded-photo-camera"
            onClick={() => setIsCameraOpen(true)}
          >
            Camera
          </button>
        )}

        <motion.button
          type="button"
          className="icon-button achievement-expanded-close"
          aria-label="Cancel editing"
          onClick={onCancel}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>

        <div className="achievement-expanded-overlay-content">
          <div className="achievement-expanded-eyebrow-row">
            <div className="achievement-expanded-mode-chips" role="group" aria-label="Mode">
              {modeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`achievement-expanded-mode-chip${mode === option ? ' is-active' : ''}`}
                  onClick={() => setMode(option)}
                >
                  {modeLabels[option]}
                </button>
              ))}
            </div>
            <span className="achievement-expanded-index">No. {String(index + 1).padStart(2, '0')}</span>
          </div>

          <input
            type="text"
            className="achievement-expanded-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-label="Title"
            autoFocus
          />

          <div className="achievement-expanded-meta">
            {bucket.completedDate && <span>{formatDate(bucket.completedDate)}</span>}
            {bucket.place && <span>{bucket.place}</span>}
          </div>
        </div>
      </div>

      <textarea
        className="achievement-expanded-message-input"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="A message to the you who achieved this"
        aria-label="Message"
        rows={3}
      />

      <div className="achievement-expanded-actions detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onCancel} {...tapProps}>
          Cancel
        </motion.button>
        <motion.button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={titleEmpty}
          {...tapProps}
        >
          Save
        </motion.button>
      </div>

      {isCameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />
      )}
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
        className="achievement-expanded"
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
            <AchievementExpandedEdit
              bucket={bucket}
              index={index}
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
