import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import AddHabitForm from './AddHabitForm';
import HabitWeekGrid from './HabitWeekGrid';
import HabitHistoryHeatmap from './HabitHistoryHeatmap';
import HabitRecordsTimeline from './HabitRecordsTimeline';
import { spring, transitions } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

// Same swap glyph as Momentum's own view toggle (see StrategyPage's
// SwapIcon) -- a deliberate duplicate, not a shared import: Core stays
// droppable with zero Strategy dependency (see this file's own header
// comment), same reasoning as topPriority.css's other duplicated rules.
function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M4 8 H17 M17 8 L13 4 M17 8 L13 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16 H7 M7 16 L11 12 M7 16 L11 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Same fade/settle/blur shape as Momentum's own view swap (see
// StrategyPage's viewVariants) -- another deliberate duplicate.
const viewVariants = {
  enter: { opacity: 0, y: 8, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: transitions.exit },
};

/*
  A goal's full screen: its identity-commitment title (unchanged from
  Core's old single-tier version), habit registration, and -- once
  there's at least one habit -- two ways to look back at what got done:
  the original heatmap pair (7-day window + collapsible 12-week
  history) or the newer Records Timeline, switched with the same
  toggle button Momentum's own Bucket Lists/Realize swap uses. The goal
  itself holds no vote/progress data -- everything below reads
  habits/logs scoped to this goal's id.
*/
function GoalDetail({
  priority,
  habits,
  allHabits = habits,
  logs,
  getLog,
  onAddHabit,
  onDeleteHabit,
  onSelectCell,
  onClose,
  readOnly = false,
}) {
  const [activeView, setActiveView] = useState('heatmap');
  // Active habits (habits) drive the heatmap pair; allHabits also
  // includes archived ones (see TopPrioritySection's expandedAllHabits)
  // so a goal that's had every habit archived still has somewhere to
  // look back at their preserved logs, instead of the whole toggle
  // disappearing along with the active list.
  const hasActiveHabits = habits.length > 0;
  const hasAnyHistory = allHabits.length > 0;

  function toggleView() {
    setActiveView((prev) => (prev === 'heatmap' ? 'timeline' : 'heatmap'));
  }

  return (
    <Modal onClose={onClose} className="detail-modal priority-detail-modal">
      <div className="modal-header detail-header">
        <div>
          <h3>{priority.title}</h3>
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

      <AddHabitForm
        habits={habits}
        onAdd={(name) => onAddHabit(priority.id, name)}
        onDelete={onDeleteHabit}
        readOnly={readOnly}
      />

      {!hasActiveHabits && !hasAnyHistory ? (
        <p className="priority-empty-note">Add a habit above to start recording days.</p>
      ) : (
        <>
          <motion.button
            type="button"
            className="priority-view-toggle"
            onClick={toggleView}
            aria-label={`Switch to ${activeView === 'heatmap' ? 'Records Timeline' : 'Heatmap'}`}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            <SwapIcon />
            {activeView === 'heatmap' ? 'Records Timeline' : 'Heatmap'}
          </motion.button>

          <AnimatePresence mode="wait">
            {activeView === 'heatmap' ? (
              <motion.div key="heatmap" variants={viewVariants} initial="enter" animate="center" exit="exit">
                {hasActiveHabits ? (
                  <>
                    <HabitWeekGrid habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
                    <HabitHistoryHeatmap habits={habits} getLog={getLog} readOnly={readOnly} onSelectCell={onSelectCell} />
                  </>
                ) : (
                  <p className="priority-empty-note">No active habits -- add one above.</p>
                )}
              </motion.div>
            ) : (
              <motion.div key="timeline" variants={viewVariants} initial="enter" animate="center" exit="exit">
                <HabitRecordsTimeline habits={allHabits} logs={logs} onSelectCell={onSelectCell} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Modal>
  );
}

export default GoalDetail;
