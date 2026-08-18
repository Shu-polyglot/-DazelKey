import { useState } from 'react';
import { motion } from 'motion/react';
import { spring } from '../../styles/motion';

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/*
  Shared by ExpandedBucketCard and BucketDetailsModal -- the two places a
  Bucket can be completed. Photo is optional: completing never blocks on it.
*/
function CompletePrompt({ bucketId, onComplete }) {
  const [completeDate, setCompleteDate] = useState('');
  const [photo, setPhoto] = useState(null);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    setPhoto(await readImageAsDataUrl(file));
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

      <label className="achieve-photo-field">
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
          <span className="achieve-photo-upload">
            Add a photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </span>
        )}
      </label>

      <motion.button type="button" className="achieve-button" onClick={handleComplete} {...commitTapProps}>
        Complete
      </motion.button>
    </div>
  );
}

export default CompletePrompt;
