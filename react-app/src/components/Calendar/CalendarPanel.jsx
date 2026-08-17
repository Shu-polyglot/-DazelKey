import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CalendarGrid from './CalendarGrid';
import CalendarDayDetails from './CalendarDayDetails';
import CalendarExpandedOverlay from './CalendarExpandedOverlay';
import { buildMonthGrid } from '../../lib/calendar';
import { formatMonth } from '../../lib/dates';
import { spring, dashboardEntrance, entranceTransition } from '../../styles/motion';
import './Calendar.css';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarPanel({ buckets, onOpenBucket }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);

  const cells = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

  function goToPrevMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function handleDayClick(isoDate) {
    setSelectedDate(isoDate);
    setExpandedDate(isoDate);
  }

  return (
    <motion.section
      className="app-section calendar-section"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(dashboardEntrance.calendar)}
    >
      <span className="section-label">Your timeline</span>

      <div className="calendar-header">
        <motion.button
          type="button"
          className="nav-button"
          aria-label="Previous month"
          onClick={goToPrevMonth}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.9, transition: spring.press }}
        >
          ←
        </motion.button>
        <h2>{formatMonth(currentMonth)}</h2>
        <motion.button
          type="button"
          className="nav-button"
          aria-label="Next month"
          onClick={goToNextMonth}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.9, transition: spring.press }}
        >
          →
        </motion.button>
      </div>

      <div className="day-names" aria-label="Weekdays">
        {dayNames.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>

      <CalendarGrid cells={cells} buckets={buckets} selectedDate={selectedDate} onDayClick={handleDayClick} />
      <CalendarDayDetails selectedDate={selectedDate} buckets={buckets} onOpenBucket={onOpenBucket} />

      <AnimatePresence>
        {expandedDate && (
          <CalendarExpandedOverlay
            key={expandedDate}
            isoDate={expandedDate}
            buckets={buckets}
            onClose={() => setExpandedDate(null)}
            onOpenBucket={(id) => {
              setExpandedDate(null);
              onOpenBucket(id);
            }}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default CalendarPanel;
