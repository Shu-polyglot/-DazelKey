import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from './Modal';
import { allowedCategories, getStatusLabel } from '../../lib/buckets';
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
    ['Category', bucket.category],
    ['Date type', bucket.dateType === 'someday' ? 'SOMEDAY' : 'EXACT DATE'],
    ['Status', getStatusLabel(bucket)],
  ];

  if (bucket.targetDate) {
    entries.push(['Target date', formatDate(bucket.targetDate)]);
  }

  if (bucket.completedDate) {
    entries.push(['Completed date', formatDate(bucket.completedDate)]);
  }

  function handleComplete() {
    const chosenDate = bucket.dateType === 'someday' ? completeDate : bucket.targetDate;

    if (!chosenDate) {
      alert('Choose the date this experience happened.');
      return;
    }

    onComplete(bucket.id, chosenDate);
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

        <div className="detail-item">
          <span className="label">Description</span>
          <span className="value">{bucket.description || 'No description yet.'}</span>
        </div>

        {bucket.location && (
          <div className="detail-item">
            <span className="label">Location</span>
            <span className="value">{bucket.location}</span>
          </div>
        )}

        {bucket.memory && (
          <div className="detail-item">
            <span className="label">Memory</span>
            <span className="value">{bucket.memory}</span>
          </div>
        )}
      </div>

      {bucket.status !== 'completed' && (
        <div className="achieve-prompt">
          <p className="achieve-prompt-label">Did you do it?</p>
          {bucket.dateType === 'someday' && (
            <label className="achieve-date-field">
              <span>When</span>
              <input type="date" value={completeDate} onChange={(event) => setCompleteDate(event.target.value)} />
            </label>
          )}
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

function DetailsEdit({ bucket, onCancel, onSave }) {
  const [title, setTitle] = useState(bucket.title);
  const [category, setCategory] = useState(bucket.category);
  const [description, setDescription] = useState(bucket.description);
  const [dateType, setDateType] = useState(bucket.dateType);
  const [targetDate, setTargetDate] = useState(bucket.targetDate || '');
  const [location, setLocation] = useState(bucket.location || '');
  const [memory, setMemory] = useState(bucket.memory || '');

  function handleSave() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      alert('Please enter a title.');
      return;
    }

    if (dateType === 'exact' && !targetDate) {
      alert('Please select a target date for exact-date experiences.');
      return;
    }

    onSave({
      title: trimmedTitle,
      category,
      description: description.trim(),
      dateType,
      targetDate: dateType === 'someday' ? null : targetDate,
      location: location.trim(),
      memory: memory.trim(),
    });
  }

  return (
    <>
      <h3>Edit memory</h3>

      <div className="detail-section">
        <label className="detail-form-label">
          <span>Title</span>
          <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="detail-form-label">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {allowedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="detail-form-label">
          <span>Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Experience the Northern Lights in Iceland."
          />
        </label>

        <label className="detail-form-label">
          <span>Date type</span>
          <select value={dateType} onChange={(event) => setDateType(event.target.value)}>
            <option value="someday">Someday</option>
            <option value="exact">Exact</option>
          </select>
        </label>

        {dateType === 'exact' && (
          <label className="detail-form-label">
            <span>Target date</span>
            <input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          </label>
        )}

        <label className="detail-form-label">
          <span>Location</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Iceland"
          />
        </label>

        <label className="detail-form-label">
          <span>Memory</span>
          <textarea
            rows={3}
            value={memory}
            onChange={(event) => setMemory(event.target.value)}
            placeholder="One of the most unreal nights of my life."
          />
        </label>
      </div>

      <div className="detail-actions">
        <motion.button type="button" className="primary-button" onClick={handleSave} {...tapProps}>
          Save changes
        </motion.button>
        <motion.button type="button" className="secondary-button" onClick={onCancel} {...tapProps}>
          Cancel
        </motion.button>
      </div>
    </>
  );
}

function BucketDetailsModal({ bucket, onClose, onUpdate, onDelete, onComplete }) {
  const [mode, setMode] = useState('view');

  return (
    <Modal onClose={onClose} className="detail-modal">
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
        {mode === 'view' ? (
          <DetailsView
            bucket={bucket}
            onClose={onClose}
            onEdit={() => setMode('edit')}
            onDelete={onDelete}
            onComplete={onComplete}
          />
        ) : (
          <DetailsEdit
            bucket={bucket}
            onCancel={() => setMode('view')}
            onSave={(patch) => {
              onUpdate(bucket.id, patch);
              setMode('view');
            }}
          />
        )}
      </div>
    </Modal>
  );
}

export default BucketDetailsModal;
