import { useState } from 'react';
import { motion } from 'motion/react';
import PhotoPickerButton from '../shared/PhotoPickerButton';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl } from '../../lib/photo';
import { easing, spring } from '../../styles/motion';
import '../Modals/Modals.css';
import '../TransitionRitual.css';
import './AchievementPhotoPrompt.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easing.emphasized } },
  exit: {
    opacity: 0,
    scale: 1.03,
    filter: 'blur(12px)',
    transition: { duration: 0.6, ease: easing.exit },
  },
};

/*
 * A quiet coda to a Doing goal's ritual (100% reached, or a flagged
 * milestone checked off) -- see App.jsx's ritual/pendingAchievement
 * state. Reuses the same photo pipeline as completing a Bucket
 * (CompletePrompt/CameraCapture/lib/photo) rather than a second one, and
 * hands whatever comes out of it (a photo, or null on Skip) straight
 * back to the caller, which is the only thing that actually knows how
 * to turn it into an Achievement entry.
 */
function AchievementPhotoPrompt({ title, onDone }) {
  const [isProcessing, setIsProcessing] = useState(false);

  async function processPhotoFile(file) {
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    setIsProcessing(true);
    try {
      const photo = await resizeImageToDataUrl(file);
      onDone(photo);
    } catch (error) {
      console.warn('Unable to process photo.', error);
      alert('Could not read that photo. Try a different file.');
      setIsProcessing(false);
    }
  }

  return (
    <motion.div
      className="transition-ritual achievement-photo-prompt"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
    >
      <div className="transition-ritual-content">
        <p className="achievement-photo-prompt-title">{title}</p>
        <p className="transition-ritual-quote">Add a photo to remember this?</p>

        <div className="achievement-photo-prompt-actions">
          <PhotoPickerButton onPhotoFile={processPhotoFile} disabled={isProcessing} />
        </div>

        <motion.button
          type="button"
          className="secondary-button achievement-photo-prompt-skip"
          onClick={() => onDone(null)}
          disabled={isProcessing}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          Skip
        </motion.button>
      </div>
    </motion.div>
  );
}

export default AchievementPhotoPrompt;
