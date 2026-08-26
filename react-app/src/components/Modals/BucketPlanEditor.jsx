import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import TimePickerClock from '../shared/TimePickerClock';
import { whenOptions, getWhenLabel, sortPlanItems, formatPlanTime } from '../../lib/buckets';
import { spring } from '../../styles/motion';
import './Modals.css';
import './BucketStepEditor.css';
import './BucketPlanEditor.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const chipTap = {
  whileHover: { scale: 1.04, transition: spring.hover },
  whileTap: { scale: 0.92, transition: spring.press },
};

function createPlanItem() {
  return { id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, time: '09:00', text: '' };
}

/*
  Replaces ExpandedBucketCard's old "Edit" destination (see its own
  onEdit prop, still named that -- only the button's label and this
  destination changed) for an existing Bucket only, never Creation
  (BucketCreateModal still uses BucketStepEditor's own title/when wizard
  as-is). Combines that same title/when editing with Plan's own new
  itinerary -- a chronological list of "HH:MM" + free-text stops, stored
  as `planItems` (see lib/buckets' normalizeBucket) and edited entirely
  in local draft state here until Save, same non-destructive pattern
  every other detail-form editor in this app uses.
*/
function BucketPlanEditor({ bucket, onCancel, onSave }) {
  const [title, setTitle] = useState(bucket.title);
  const [when, setWhen] = useState(bucket.when);
  const [planItems, setPlanItems] = useState(() => sortPlanItems(bucket.planItems || []));
  const [editingTimeId, setEditingTimeId] = useState(null);

  const titleEmpty = !title.trim();
  const editingItem = planItems.find((item) => item.id === editingTimeId) || null;

  function handleAddItem() {
    setPlanItems((prev) => [...prev, createPlanItem()]);
  }

  function handleTextChange(id, text) {
    setPlanItems((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  // Re-sorts immediately on commit, not while the picker's still open --
  // TimePickerClock keeps its own draft time until Done, so this list
  // never reflows out from under a still-open popup (see that
  // component's own header comment).
  function handleTimeDone(id, time) {
    setPlanItems((prev) => sortPlanItems(prev.map((item) => (item.id === id ? { ...item, time } : item))));
    setEditingTimeId(null);
  }

  function handleRemoveItem(id) {
    setPlanItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    onSave({
      title: trimmedTitle,
      when,
      planItems: planItems.map((item) => ({ ...item, text: item.text.trim() })),
    });
  }

  return (
    <div className="plan-editor">
      <div className="plan-editor-topbar">
        <h3>Plan</h3>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Cancel"
          onClick={onCancel}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <form className="detail-form" onSubmit={handleSubmit} noValidate>
        <label className="detail-form-label" htmlFor="plan-title-input">
          <span>Title</span>
          <input
            id="plan-title-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Watch the Northern Lights in Iceland"
            autoFocus
          />
        </label>

        <div className="detail-form-label">
          <span>When</span>
          <div className="step-editor-chip-row plan-editor-when-row" role="group" aria-label="When">
            {whenOptions.map((option) => (
              <motion.button
                key={option}
                type="button"
                className={`step-editor-chip${when === option ? ' is-active' : ''}`}
                onClick={() => setWhen(option)}
                {...chipTap}
              >
                {getWhenLabel(option)}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="plan-editor-itinerary">
          <div className="plan-editor-itinerary-heading">
            <span>Itinerary</span>
            <motion.button type="button" className="plan-editor-add-button" onClick={handleAddItem} {...tapProps}>
              + Add
            </motion.button>
          </div>

          {planItems.length === 0 ? (
            <div className="plan-editor-empty">No stops yet -- add the first one below.</div>
          ) : (
            <div className="plan-editor-list">
              {planItems.map((item) => (
                <div className="plan-editor-row" key={item.id}>
                  <button type="button" className="plan-editor-time-button" onClick={() => setEditingTimeId(item.id)}>
                    {formatPlanTime(item.time)}
                  </button>
                  <input
                    type="text"
                    className="plan-editor-text-input"
                    value={item.text}
                    onChange={(event) => handleTextChange(item.id, event.target.value)}
                    placeholder="What happens here?"
                  />
                  <button
                    type="button"
                    className="icon-button plan-editor-remove"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Remove this stop"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions plan-editor-actions">
          <motion.button type="button" className="secondary-button" onClick={onCancel} {...tapProps}>
            Cancel
          </motion.button>
          <motion.button type="submit" className="primary-button" disabled={titleEmpty} {...tapProps}>
            Save
          </motion.button>
        </div>
      </form>

      {createPortal(
        <AnimatePresence>
          {editingItem && (
            <TimePickerClock
              key="time-picker"
              time={editingItem.time}
              onDone={(time) => handleTimeDone(editingItem.id, time)}
              onCancel={() => setEditingTimeId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default BucketPlanEditor;
