import { useState } from 'react';
import { motion } from 'motion/react';
import CameraCapture from './CameraCapture';
import { spring } from '../../styles/motion';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl, supportsCamera } from '../../lib/photo';

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

/*
  Shared by ExpandedBucketCard and BucketDetailsModal -- the two places a
  Bucket can be completed. Photo is optional: completing never blocks on it.
*/
function CompletePrompt({ bucketId, onComplete }) {
  const [completeDate, setCompleteDate] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

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

  function handleComplete() {
    if (!completeDate) {
      alert('Choose the date this experience happened.');
      return;
    }

    onComplete(bucketId, completeDate, photo);
  }

  return (
    <div className="achieve-prompt">
      <p className="achieve-prompt-label">Did you do it?</p>
      <label className="achieve-date-field">
        <span>When</span>
        <input type="date" value={completeDate} onChange={(event) => setCompleteDate(event.target.value)} />
      </label>

      <div className="achieve-photo-field">
        <span>Photo (optional)</span>
        {photo ? (
          <div className="achieve-photo-preview">
            <img src={photo} alt="" />
            <button
              type="button"
              className="achieve-photo-remove"
              onClick={() => setPhoto(null)}
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="achieve-photo-actions">
            {supportsCamera ? (
              <button type="button" className="achieve-photo-upload" onClick={() => setIsCameraOpen(true)}>
                Take Photo
              </button>
            ) : (
              <span className="achieve-photo-upload">
                Take Photo
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
              </span>
            )}
            <span className="achieve-photo-upload">
              Choose from Library
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </span>
          </div>
        )}
      </div>

      <motion.button type="button" className="achieve-button" onClick={handleComplete} {...commitTapProps}>
        Complete
      </motion.button>

      {isCameraOpen && (
        <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />
      )}
    </div>
  );
}

export default CompletePrompt;
