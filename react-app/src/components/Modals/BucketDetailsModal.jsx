import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from './Modal';
import BucketStepEditor from './BucketStepEditor';
import { getStatusLabel, whenLabels, modeLabels } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const commitTapProps = {
  whileHover: { y: -2, transition: spring.hover },
  whileTap: { y: 1, scale: 0.95, transition: spring.commit },
};

function DetailsView({ bucket, onClose, onEdit, onDelete, onComplete }) {
  const [completeDate, setCompleteDate] = useState('');

  const entries = [
    ['Mode', modeLabels[bucket.mode]],
    ['Status', getStatusLabel(bucket)],
  ];

  if (bucket.status === 'completed') {
    if (bucket.completedDate) {
      entries.push(['Completed date', formatDate(bucket.completedDate)]);
    }
  } else {
    entries.push(['When', whenLabels[bucket.when]]);
  }

  if (bucket.place) {
    entries.push(['Place', bucket.place]);
  }

  function handleComplete() {
    if (!completeDate) {
      alert('Choose the date this experience happened.');
      return;
    }

    onComplete(bucket.id, completeDate);
  }

  function handleDelete() {
    if (confirm('Delete this experience?\n\nThis action cannot be undone.')) {
      onDelete(bucket.id);
    }
  }

  return (
    <>
      {bucket.status === 'completed' && <p className="archived-tag">In the Archive</p>}
      <h3>{bucket.title}</h3>

      <div className="detail-section">
        <div className="detail-meta">
          {entries.map(([label, value]) => (
            <div className="detail-item" key={label}>
              <span className="label">{label}</span>
              <span className="value">{value}</span>
            </div>
          ))}
        </div>

        {bucket.message && (
          <div className="detail-item">
            <span className="label">Message</span>
            <span className="value">{bucket.message}</span>
          </div>
        )}
      </div>

      {bucket.status !== 'completed' && (
        <div className="achieve-prompt">
          <p className="achieve-prompt-label">Did you do it?</p>
          <label className="achieve-date-field">
            <span>When</span>
            <input type="date" value={completeDate} onChange={(event) => setCompleteDate(event.target.value)} />
          </label>
          <motion.button type="button" className="achieve-button" onClick={handleComplete} {...commitTapProps}>
            Mark it as done
          </motion.button>
        </div>
      )}

      <div className="detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onEdit} {...tapProps}>
          Edit
        </motion.button>
        <motion.button type="button" className="secondary-button" onClick={handleDelete} {...tapProps}>
          Delete
        </motion.button>
        <motion.button type="button" className="secondary-button" onClick={onClose} {...tapProps}>
          Close
        </motion.button>
      </div>
    </>
  );
}

function BucketDetailsModal({ bucket, onClose, onUpdate, onDelete, onComplete }) {
  const [mode, setMode] = useState('view');
  const isEditing = mode === 'edit';

  return (
    <Modal onClose={onClose} className={isEditing ? 'detail-modal step-editor-modal' : 'detail-modal'}>
      {isEditing ? (
        <BucketStepEditor
          bucket={bucket}
          onCancel={() => setMode('view')}
          onSave={(patch) => {
            onUpdate(bucket.id, patch);
            setMode('view');
          }}
        />
      ) : (
        <>
          <div className="modal-header detail-header">
            <h3>Bucket details</h3>
            <motion.button
              type="button"
              className="icon-button"
              aria-label="Close details"
              onClick={onClose}
              whileHover={{ rotate: 90, transition: spring.hover }}
              whileTap={{ scale: 0.88, transition: spring.press }}
            >
              ×
            </motion.button>
          </div>

          <div className="detail-content">
            <DetailsView
              bucket={bucket}
              onClose={onClose}
              onEdit={() => setMode('edit')}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          </div>
        </>
      )}
    </Modal>
  );
}

export default BucketDetailsModal;
