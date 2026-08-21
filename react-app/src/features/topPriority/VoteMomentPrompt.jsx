import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import CameraCapture from '../../components/shared/CameraCapture';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl, supportsCamera } from '../../lib/photo';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import '../../components/Modals/BucketStepEditor.css';
import './topPriority.css';

const MAX_COMMENT_LENGTH = 140;

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  A light, skippable beat right after casting a vote (see
  TopPrioritySection's handleCastVote) -- not the full-screen ritual
  MilestoneRitual uses, just a regular modal, since attaching a photo/note
  to today's vote is an optional extra, not a moment being celebrated.
  Saved fields land on that vote via useVotes' attachVoteMedia.
*/
function VoteMomentPrompt({ onSave, onSkip }) {
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function processPhotoFile(file) {
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPhoto(dataUrl);
    } catch (error) {
      console.warn('Unable to process photo.', error);
      alert('Could not read that photo. Try a different file.');
    } finally {
      setIsProcessing(false);
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
    onSave({ photoUrl: photo, comment: comment.trim() });
  }

  const hasContent = Boolean(photo) || comment.trim().length > 0;

  return (
    <Modal onClose={onSkip} className="vote-moment-prompt-modal">
      <div className="modal-header">
        <h3>Add a photo &amp; note?</h3>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close"
          onClick={onSkip}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <p className="vote-moment-prompt-subtitle">Capture today's vote, if you'd like -- totally optional.</p>

      {photo ? (
        <div className="achieve-photo-preview vote-moment-photo-preview">
          <img src={photo} alt="" />
        </div>
      ) : (
        <div className="achieve-photo-actions">
          {supportsCamera ? (
            <button
              type="button"
              className="achieve-photo-upload"
              onClick={() => setIsCameraOpen(true)}
              disabled={isProcessing}
            >
              Take Photo
            </button>
          ) : (
            <span className="achieve-photo-upload">
              Take Photo
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} disabled={isProcessing} />
            </span>
          )}
          <span className="achieve-photo-upload">
            Choose from Library
            <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isProcessing} />
          </span>
        </div>
      )}

      <label className="step-editor-field-label vote-moment-comment-label" htmlFor="vote-moment-comment">
        <span className="sr-only">A short note</span>
        <textarea
          id="vote-moment-comment"
          className="step-editor-field-input vote-moment-comment-input"
          value={comment}
          onChange={(event) => setComment(event.target.value.slice(0, MAX_COMMENT_LENGTH))}
          placeholder="A short note about today (optional)"
          rows={2}
        />
      </label>

      <div className="detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onSkip} {...tapProps}>
          Skip
        </motion.button>
        <motion.button type="button" className="primary-button" onClick={handleSave} disabled={!hasContent || isProcessing} {...tapProps}>
          Save
        </motion.button>
      </div>

      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </Modal>
  );
}

export default VoteMomentPrompt;
