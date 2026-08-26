import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { spring } from '../../styles/motion';
import './TimePickerClock.css';

const HOUR_MARKS = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
const MINUTE_MARKS = Array.from({ length: 12 }, (_, i) => i * 5);

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

function parseTime(time) {
  const [hourStr, minuteStr] = /^\d{2}:\d{2}$/.test(time) ? time.split(':') : ['09', '00'];
  const hour24 = Number(hourStr);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return { hour12, minute: Number(minuteStr), period };
}

function toHour24(hour12, period) {
  const base = hour12 % 12;
  return period === 'PM' ? base + 12 : base;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

// Position of mark `index` (0 = 12 o'clock, clockwise) on a circle of
// `radiusPct`% centered in the face -- percentages so the whole face
// scales with its container's own size (see the CSS's width/height,
// including the narrow-screen media query) with no JS recalculation.
function markPosition(index) {
  const angleRad = ((index * 30) * Math.PI) / 180;
  const radiusPct = 38;
  return {
    left: `${50 + radiusPct * Math.sin(angleRad)}%`,
    top: `${50 - radiusPct * Math.cos(angleRad)}%`,
  };
}

/*
  An analog-clock-style time picker: a 12-position dial, dragged (or
  tapped anywhere on the face -- pointerdown alone sets the value, drag
  just keeps adjusting it) to set the hour, then the minute, snapped to
  5-minute marks. Own draft state throughout -- nothing reaches the
  caller until Done, so a BucketPlanEditor row's list can re-sort itself
  by time without this popup (portaled separately, see its own caller)
  visually jumping mid-drag.
*/
function TimePickerClock({ time, onDone, onCancel }) {
  const initial = parseTime(time);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);
  const [mode, setMode] = useState('hour');

  const faceRef = useRef(null);
  const draggingRef = useRef(false);
  const advanceTimeout = useRef(null);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  function angleFromEvent(event) {
    const rect = faceRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return (deg + 360) % 360;
  }

  function applyAngle(deg) {
    if (mode === 'hour') {
      const nextHour = Math.round(deg / 30) % 12;
      setHour12(nextHour === 0 ? 12 : nextHour);
    } else {
      const index = Math.round(deg / 30) % 12;
      setMinute(index * 5);
    }
  }

  function handlePointerDown(event) {
    event.preventDefault();
    faceRef.current?.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    applyAngle(angleFromEvent(event));
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) {
      return;
    }
    applyAngle(angleFromEvent(event));
  }

  function handlePointerUp(event) {
    if (!draggingRef.current) {
      return;
    }
    draggingRef.current = false;
    faceRef.current?.releasePointerCapture(event.pointerId);
    if (mode === 'hour') {
      // Same quick-advance-after-a-choice pattern as BucketStepEditor's
      // own When step -- picking an hour auto-steps to the minute dial
      // rather than requiring a second tap on the "05" label.
      clearTimeout(advanceTimeout.current);
      advanceTimeout.current = setTimeout(() => setMode('minute'), 220);
    }
  }

  function handleDone() {
    onDone(`${pad2(toHour24(hour12, period))}:${pad2(minute)}`);
  }

  const marks = mode === 'hour' ? HOUR_MARKS : MINUTE_MARKS;
  const handAngle = mode === 'hour' ? (hour12 % 12) * 30 : (minute / 5) * 30;

  return (
    <div
      className="time-picker-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        className="time-picker"
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={spring.soft}
      >
        <div className="time-picker-readout">
          <button
            type="button"
            className={`time-picker-part${mode === 'hour' ? ' is-active' : ''}`}
            onClick={() => setMode('hour')}
          >
            {pad2(hour12)}
          </button>
          <span className="time-picker-colon">:</span>
          <button
            type="button"
            className={`time-picker-part${mode === 'minute' ? ' is-active' : ''}`}
            onClick={() => setMode('minute')}
          >
            {pad2(minute)}
          </button>

          <div className="time-picker-period" role="group" aria-label="AM or PM">
            <button
              type="button"
              className={`time-picker-period-button${period === 'AM' ? ' is-active' : ''}`}
              onClick={() => setPeriod('AM')}
            >
              AM
            </button>
            <button
              type="button"
              className={`time-picker-period-button${period === 'PM' ? ' is-active' : ''}`}
              onClick={() => setPeriod('PM')}
            >
              PM
            </button>
          </div>
        </div>

        <div
          ref={faceRef}
          className="time-picker-face"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="time-picker-hand" style={{ transform: `translateX(-50%) rotate(${handAngle}deg)` }} />
          <div className="time-picker-center-dot" />
          {marks.map((mark, index) => (
            <span key={mark} className="time-picker-mark" style={markPosition(index)}>
              {mode === 'minute' ? pad2(mark) : mark}
            </span>
          ))}
        </div>

        <div className="time-picker-actions modal-actions">
          <motion.button type="button" className="secondary-button" onClick={onCancel} {...tapProps}>
            Cancel
          </motion.button>
          <motion.button type="button" className="primary-button" onClick={handleDone} {...tapProps}>
            Done
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default TimePickerClock;
