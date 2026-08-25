import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import CameraCapture from '../../components/shared/CameraCapture';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl, supportsCamera } from '../../lib/photo';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import '../../components/Modals/BucketStepEditor.css';
import './topPriority.css';

const MAX_JOURNAL_LENGTH = 280;
const PHOTO_MAX_DIMENSION = 900;
const PHOTO_QUALITY = 0.7;

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  What a heatmap cell opens into, for both states a cell can be in --
  see HabitWeekGrid/HabitHistoryHeatmap's onSelectCell. An undone cell
  opens this in "record" mode: tapping it never sets done by itself,
  only the "Record" button inside does, so a cancelled/closed modal
  leaves the day untouched. A done cell opens in "view" mode: photo/
  journal are shown, both editable and independently removable, plus
  an "Undo" that deletes the whole log (see topPriority.js's undoLog --
  there's no partial "undone but still has a photo" state).
*/
function HabitCellModal({ habitName, date, log, readOnly = false, onRecord, onUpdateMedia, onUndo, onClose }) {
  const isDone = Boolean(log);
  const [isEditing, setIsEditing] = useState(!isDone);
  const [photo, setPhoto] = useState(log?.photo || null);
  const [journal, setJournal] = useState(log?.journal || '');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  async function processPhotoFile(file) {
    if (file.size > MAX_PHOTO_BYTES) {
      alert('That photo is too large. Choose one under 5MB.');
      return;
    }
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, { maxDimension: PHOTO_MAX_DIMENSION, quality: PHOTO_QUALITY });
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

  function handleRecord() {
    onRecord({ photo, journal: journal.trim() });
    onClose();
  }

  function handleSaveEdit() {
    onUpdateMedia({ photo, journal: journal.trim() || null });
    setIsEditing(false);
  }

  function handleUndo() {
    onUndo();
    onClose();
  }

  const showForm = !isDone || isEditing;

  return (
    <Modal onClose={onClose} className="habit-cell-modal">
      <div className="modal-header detail-header">
        <div>
          <p className="habit-cell-modal-date">{formatDate(date)}</p>
          <p className="habit-cell-modal-habit">{habitName}</p>
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

      {showForm ? (
        <>
          {photo ? (
            <div className="achieve-photo-preview habit-cell-photo-preview">
              <img src={photo} alt="" />
              {!readOnly && (
                <button type="button" className="secondary-button habit-cell-photo-remove" onClick={() => setPhoto(null)}>
                  Remove photo
                </button>
              )}
            </div>
          ) : (
            !readOnly && (
              <div className="achieve-photo-actions">
                {supportsCamera ? (
                  <button type="button" className="achieve-photo-upload" onClick={() => setIsCameraOpen(true)} disabled={isProcessing}>
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
            )
          )}

          {!readOnly && (
            <label className="step-editor-field-label habit-cell-journal-label" htmlFor="habit-cell-journal">
              <span className="sr-only">A short note</span>
              <textarea
                id="habit-cell-journal"
                className="step-editor-field-input habit-cell-journal-input"
                value={journal}
                onChange={(event) => setJournal(event.target.value.slice(0, MAX_JOURNAL_LENGTH))}
                placeholder="A short note (optional)"
                rows={3}
              />
            </label>
          )}

          {!readOnly && (
            <div className="detail-actions">
              {isDone && (
                <motion.button type="button" className="secondary-button" onClick={() => setIsEditing(false)} {...tapProps}>
                  Cancel
                </motion.button>
              )}
              <motion.button
                type="button"
                className="primary-button"
                onClick={isDone ? handleSaveEdit : handleRecord}
                disabled={isProcessing}
                {...tapProps}
              >
                {isDone ? 'Save' : 'Record'}
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <>
          {log.photo && <img src={log.photo} alt="" className="habit-cell-modal-photo" />}
          {log.journal && <p className="habit-cell-modal-journal">{log.journal}</p>}
          {!log.photo && !log.journal && <p className="habit-cell-modal-empty">Recorded, no photo or note.</p>}

          {!readOnly && (
            <div className="detail-actions">
              <motion.button type="button" className="secondary-button" onClick={handleUndo} {...tapProps}>
                Mark as not done
              </motion.button>
              <motion.button type="button" className="primary-button" onClick={() => setIsEditing(true)} {...tapProps}>
                Edit
              </motion.button>
            </div>
          )}
        </>
      )}

      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}
    </Modal>
  );
}

export default HabitCellModal;
