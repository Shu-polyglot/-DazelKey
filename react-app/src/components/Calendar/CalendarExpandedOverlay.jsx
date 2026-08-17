import { motion } from 'motion/react';
import { getBucketMatchesForDate } from '../../lib/calendar';
import { getStatusLabel } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { transitions } from '../../styles/motion';

const overlayVariants = {
  hidden: { opacity: 0, transition: transitions.exit },
  visible: { opacity: 1, transition: transitions.standard },
};

const sheetVariants = {
  hidden: { y: '12%', opacity: 0, scale: 0.98, filter: 'blur(6px)', transition: transitions.exit },
  visible: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: transitions.emphasis },
};

function CalendarExpandedOverlay({ isoDate, buckets, onClose, onOpenBucket }) {
  const matches = getBucketMatchesForDate(buckets, isoDate);

  return (
    <motion.div
      className="calendar-detail-expanded visible"
      aria-hidden="false"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div className="calendar-detail-overlay" onClick={onClose} variants={overlayVariants} />
      <motion.div className="calendar-detail-container" variants={sheetVariants}>
        <motion.button
          type="button"
          className="calendar-detail-close"
          aria-label="Close expanded calendar detail"
          onClick={onClose}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.9 }}
          transition={transitions.press}
        >
          ←
        </motion.button>

        <div className="calendar-detail-expanded-header">
          <h2>{formatDate(isoDate)}</h2>
        </div>

        <div className="expanded-calendar-details" aria-live="polite">
          {matches.length === 0 ? (
            <>
              <h3>Nothing here yet</h3>
              <ul>
                <li>No experiences marked for this day.</li>
              </ul>
            </>
          ) : (
            <>
              <h3>This day</h3>
              <ul>
                {matches.map((bucket) => (
                  <li key={bucket.id} data-status={getStatusLabel(bucket)}>
                    <button type="button" className="day-link" onClick={() => onOpenBucket(bucket.id)}>
                      {bucket.title}
                    </button>
                    <br />
                    <span className="expanded-detail-status">{getStatusLabel(bucket)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CalendarExpandedOverlay;
