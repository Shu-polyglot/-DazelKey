import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import GoalCard from './GoalCard';
import GoalDetail from './GoalDetail';
import AddPriorityFlow from './AddPriorityFlow';
import HabitCellModal from './HabitCellModal';
import { useTopPriorities, useHabits, useHabitLogs, MAX_TOP_PRIORITIES } from './topPriority';
import { spring } from '../../styles/motion';
import './topPriority.css';

/*
  Core (formerly "Top 3 Priority"), end to end: goals (its own data
  store, capped at MAX_TOP_PRIORITIES), habits registered per goal, and
  the daily habit-log heatmap -- see topPriority.js for all three
  stores. Goals themselves carry no vote/milestone/progress data
  anymore; every recording action lives on the habit-log side (see
  HabitCellModal). This component needs nothing handed down from
  Strategy to run standalone. (Internal module/route names stay
  "topPriority"/"priority" on purpose -- only the user-facing label
  changed.)
*/
function TopPrioritySection({ readOnly = false }) {
  const { priorities, addPriority } = useTopPriorities();
  const { habits, addHabit, deleteHabit } = useHabits();
  const { getLog, recordLog, updateLogMedia, undoLog } = useHabitLogs();

  const [expandedId, setExpandedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  // { habit, date, log } | null -- the cell a heatmap tap opened,
  // whichever grid (7-day or 12-week history) it came from.
  const [selectedCell, setSelectedCell] = useState(null);

  const atCap = priorities.length >= MAX_TOP_PRIORITIES;
  const expanded = priorities.find((priority) => priority.id === expandedId) || null;
  const expandedHabits = habits.filter((habit) => habit.goalId === expandedId);

  function handleAdd({ commitment }) {
    const record = addPriority({ title: commitment });
    if (record) {
      setIsAddOpen(false);
    }
  }

  function handleAddHabit(goalId, name) {
    addHabit(goalId, name);
  }

  function handleSelectCell(habit, date, log) {
    setSelectedCell({ habit, date, log });
  }

  return (
    <>
      <div className="section-heading-row priority-heading-row">
        <h3>Core</h3>
        {!readOnly && !atCap && (
          <motion.button
            type="button"
            className="priority-add-icon"
            aria-label="Add a Priority"
            onClick={() => setIsAddOpen(true)}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.94, transition: spring.press }}
          >
            +
          </motion.button>
        )}
      </div>

      {priorities.length === 0 ? (
        <div className="priority-empty">
          {readOnly ? 'Nothing here yet.' : 'Write your first priority below to start building habits toward it.'}
        </div>
      ) : (
        <div className="priority-list">
          {priorities.map((priority) => (
            <GoalCard
              key={priority.id}
              priority={priority}
              habits={habits.filter((habit) => habit.goalId === priority.id)}
              getLog={getLog}
              onOpen={() => setExpandedId(priority.id)}
              onSelectCell={handleSelectCell}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {!readOnly && atCap && (
        <p className="priority-limit-note">
          You're focusing on {MAX_TOP_PRIORITIES} at a time -- complete or remove one to add another.
        </p>
      )}

      {createPortal(
        <AnimatePresence>
          {expanded && (
            <GoalDetail
              key={expanded.id}
              priority={expanded}
              habits={expandedHabits}
              getLog={getLog}
              onAddHabit={handleAddHabit}
              onDeleteHabit={deleteHabit}
              onSelectCell={handleSelectCell}
              onClose={() => setExpandedId(null)}
              readOnly={readOnly}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {selectedCell && (
            <HabitCellModal
              key="habit-cell-modal"
              habitName={selectedCell.habit.name}
              date={selectedCell.date}
              log={selectedCell.log}
              readOnly={readOnly}
              onRecord={(media) => recordLog(selectedCell.habit.id, selectedCell.date, media)}
              onUpdateMedia={(media) => updateLogMedia(selectedCell.habit.id, selectedCell.date, media)}
              onUndo={() => undoLog(selectedCell.habit.id, selectedCell.date)}
              onClose={() => setSelectedCell(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isAddOpen && <AddPriorityFlow key="add-priority" onSave={handleAdd} onClose={() => setIsAddOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export default TopPrioritySection;
