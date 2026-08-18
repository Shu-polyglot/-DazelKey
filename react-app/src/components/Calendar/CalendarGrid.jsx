import { motion } from 'motion/react';
import { getBucketMatchesForDate } from '../../lib/calendar';
import { toIsoDate } from '../../lib/dates';
import { spring } from '../../styles/motion';

const today = new Date();
const todayIso = toIsoDate(today.getFullYear(), today.getMonth(), today.getDate());

function CalendarGrid({ cells, buckets, selectedDate, onDayClick }) {
  return (
    <div className="calendar-grid" aria-live="polite">
      {cells.map((cell, index) => {
        if (cell.muted) {
          return <div className="calendar-day is-muted" key={`muted-${index}`} />;
        }

        const matches = getBucketMatchesForDate(buckets, cell.isoDate);
        const hasCompleted = matches.some((bucket) => bucket.status === 'completed');
        const photoBucket = matches.find((bucket) => bucket.status === 'completed' && bucket.image);

        const classNames = ['calendar-day'];
        if (matches.length) {
          classNames.push(hasCompleted ? 'has-event' : 'has-plan');
        }
        if (photoBucket) {
          classNames.push('has-photo');
        }
        if (cell.isoDate === todayIso) {
          classNames.push('is-today');
        }
        if (cell.isoDate === selectedDate) {
          classNames.push('is-selected');
        }

        return (
          <motion.div
            key={cell.isoDate}
            className={classNames.join(' ')}
            onClick={() => onDayClick(cell.isoDate)}
            animate={hasCompleted ? { scale: 1.05, y: -3 } : { scale: 1, y: 0 }}
            transition={hasCompleted ? spring.soft : undefined}
            whileHover={
              hasCompleted
                ? { scale: 1.07, y: -5, transition: spring.hover }
                : { y: -2, transition: spring.hover }
            }
            whileTap={
              hasCompleted
                ? { scale: 1.1, y: -6, transition: spring.commit }
                : { y: 0, scale: 0.93, transition: spring.press }
            }
          >
            {photoBucket && (
              <>
                <div className="calendar-day-photo" style={{ backgroundImage: `url(${photoBucket.image})` }} />
                <div className="calendar-day-photo-scrim" />
              </>
            )}
            <span className="date-number">{cell.day}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default CalendarGrid;
