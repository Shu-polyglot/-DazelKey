import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import PhotoPickerButton from '../../components/shared/PhotoPickerButton';
import { MAX_PHOTO_BYTES, resizeImageToDataUrl } from '../../lib/photo';
import { formatDate, todayIso } from '../../lib/dates';
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
  What a priority's "Action" button opens -- was HabitCellModal (habit +
  date + per-day done log) before Core retired habits entirely in favor
  of free-form Actions; this is that exact same photo+journal UI, just
  keyed to an Action (goalId + timestamp) instead of a habit/date pair,
  since there's no day slot to fill anymore -- a goal can carry any
  number of Actions, whenever. No `action` prop: record mode, tapping
  "Record" always creates a new entry (never overwrites one, unlike the
  old one-per-day cell). An `action` passed in (from HabitRecordsTimeline)
  opens in view mode instead -- photo/journal shown, both editable, plus
  Delete for removing that one entry outright (the old "mark as not
  done" doesn't apply here; there's no day to un-mark, just this one
  record to keep or drop).
*/
function ActionRecordModal({ priorityTitle, action, readOnly = false, onRecord, onUpdateMedia, onDelete, onClose }) {
  const isExisting = Boolean(action);
  const [isEditing, setIsEditing] = useState(!isExisting);
  const [photo, setPhoto] = useState(action?.photo || null);
  const [journal, setJournal] = useState(action?.journal || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const date = isExisting ? action.time.slice(0, 10) : todayIso();

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

  function handleRecord() {
    onRecord({ photo, journal: journal.trim() });
    onClose();
  }

  function handleSaveEdit() {
    onUpdateMedia({ photo, journal: journal.trim() || null });
    setIsEditing(false);
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  const showForm = !isExisting || isEditing;

  return (
    <Modal onClose={onClose} className="habit-cell-modal">
      <div className="modal-header detail-header">
        <div>
          <p className="habit-cell-modal-date">{formatDate(date)}</p>
          <p className="habit-cell-modal-habit">{priorityTitle}</p>
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
                <PhotoPickerButton onPhotoFile={processPhotoFile} disabled={isProcessing} />
              </div>
            )
          )}

          {!readOnly && (
            <label className="step-editor-field-label habit-cell-journal-label" htmlFor="action-record-journal">
              <span className="sr-only">A short note</span>
              <textarea
                id="action-record-journal"
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
              {isExisting && (
                <motion.button type="button" className="secondary-button" onClick={() => setIsEditing(false)} {...tapProps}>
                  Cancel
                </motion.button>
              )}
              <motion.button
                type="button"
                className="primary-button"
                onClick={isExisting ? handleSaveEdit : handleRecord}
                disabled={isProcessing}
                {...tapProps}
              >
                {isExisting ? 'Save' : 'Record'}
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <>
          {action.photo && <img src={action.photo} alt="" className="habit-cell-modal-photo" />}
          {action.journal && <p className="habit-cell-modal-journal">{action.journal}</p>}
          {!action.photo && !action.journal && <p className="habit-cell-modal-empty">Recorded, no photo or note.</p>}

          {!readOnly && (
            <div className="detail-actions">
              <motion.button type="button" className="secondary-button" onClick={handleDelete} {...tapProps}>
                Delete
              </motion.button>
              <motion.button type="button" className="primary-button" onClick={() => setIsEditing(true)} {...tapProps}>
                Edit
              </motion.button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export default ActionRecordModal;
