import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toBlob } from 'html-to-image';
import ShareCard from './ShareCard';
import { spring, transitions } from '../../styles/motion';
import './ShareModal.css';

const backdropVariants = {
  hidden: { opacity: 0, transition: transitions.exit },
  visible: { opacity: 1, transition: transitions.standard },
};

const sheetVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)', transition: transitions.exit },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: transitions.emphasis },
};

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

function slugify(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'achievement'
  );
}

/*
  The on-screen card *is* the capture source -- html-to-image rasterizes
  cardRef's current rendered box, then pixelRatio scales that up to a
  consistent ~1080px-wide export regardless of how large the preview
  happens to be on this device. Keeps preview and export pixel-identical.
*/
async function captureCard(node) {
  if (!node) {
    return null;
  }
  const pixelRatio = Math.min(4, 1080 / node.offsetWidth);
  return toBlob(node, { pixelRatio, cacheBust: true });
}

function ShareModal({ bucket, onClose }) {
  const cardRef = useRef(null);
  const toastTimer = useRef(null);
  const [busy, setBusy] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  const slug = slugify(bucket.title);
  const shareUrl = `${window.location.origin}${window.location.pathname}#achievement-${bucket.id}`;
  const shareText = `${bucket.title} — an achievement from my DazelKey.`;

  async function handleSaveImage() {
    if (busy) return;
    setBusy('save');
    try {
      const blob = await captureCard(cardRef.current);
      if (!blob) throw new Error('Card capture returned no image data');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${slug}-achievement.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      showToast('Saved');
    } catch (error) {
      console.warn('Unable to save the share card image.', error);
      showToast("Couldn't save image");
    } finally {
      setBusy(null);
    }
  }

  async function handleShare() {
    if (busy) return;
    setBusy('share');
    try {
      const blob = await captureCard(cardRef.current);
      const file = blob ? new File([blob], `${slug}-achievement.png`, { type: 'image/png' }) : null;

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: bucket.title, text: shareText });
      } else if (navigator.share) {
        await navigator.share({ title: bucket.title, text: shareText, url: shareUrl });
      } else {
        await handleCopyLink();
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.warn('Unable to open the share sheet.', error);
        showToast("Couldn't share");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      showToast('Copied');
    } catch (error) {
      console.warn('Unable to copy the share link.', error);
      showToast("Couldn't copy link");
    }
  }

  return (
    <motion.div
      className="share-modal-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div className="share-modal" role="dialog" aria-modal="true" variants={sheetVariants}>
        <div className="share-modal-header">
          <h3>Share Achievement</h3>
          <motion.button
            type="button"
            className="icon-button share-modal-close"
            aria-label="Close"
            onClick={onClose}
            whileHover={{ rotate: 90, transition: spring.hover }}
            whileTap={{ scale: 0.88, transition: spring.press }}
          >
            ×
          </motion.button>
        </div>

        <div className="share-modal-preview">
          <ShareCard ref={cardRef} bucket={bucket} />
        </div>

        <div className="share-modal-actions">
          <motion.button
            type="button"
            className="secondary-button share-action-button"
            onClick={handleSaveImage}
            disabled={busy === 'save'}
            {...tapProps}
          >
            {busy === 'save' ? 'Saving…' : 'Save Image'}
          </motion.button>
          <motion.button
            type="button"
            className="achieve-button share-action-button"
            onClick={handleShare}
            disabled={busy === 'share'}
            {...tapProps}
          >
            {busy === 'share' ? 'Sharing…' : '↗ Share'}
          </motion.button>
          <motion.button
            type="button"
            className="secondary-button share-action-button"
            onClick={handleCopyLink}
            {...tapProps}
          >
            Copy Link
          </motion.button>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="share-modal-toast"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={transitions.micro}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default ShareModal;
