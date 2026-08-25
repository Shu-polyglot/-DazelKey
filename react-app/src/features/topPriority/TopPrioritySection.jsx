import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import GoalCard from './GoalCard';
import GoalCardMenu from './GoalCardMenu';
import GoalEditModal from './GoalEditModal';
import GoalDetail from './GoalDetail';
import AddPriorityFlow from './AddPriorityFlow';
import HabitCellModal from './HabitCellModal';
import { useTopPriorities, useHabits, useHabitLogs, MAX_TOP_PRIORITIES } from './topPriority';
import { spring } from '../../styles/motion';
import './topPriority.css';

/*
  Core (formerly "Top 3 Priority"), end to end: goals (its own data
  store, capped at MAX_TOP_PRIORITIES), habits registered per goal, and
  the daily habit log -- see topPriority.js for all three stores. Goals
  themselves carry no vote/milestone/progress data anymore; every
  recording action lives on the habit-log side (see HabitCellModal).
  Editing (title/commitment, habit add-remove) lives entirely behind a
  goal card's long-press menu (GoalCardMenu -> GoalEditModal); tapping
  a card instead opens GoalDetail, a read-only look back via Records
  Timeline -- the heatmap views that used to live there too are gone.
  This component needs nothing handed down from Strategy to run
  standalone. (Internal module/route names stay "topPriority"/
  "priority" on purpose -- only the user-facing label changed.)
*/
// `variant`: 'embedded' (default) renders just Core's own sub-heading
// (h3 + add icon), no outer page chrome -- for dropping into another
// page's own section (Momentum's toggle before the Core/Bucket Lists
// swap, PreviewProfile's shared-profile stack today). 'page' wraps that
// same content in the app-section/eyebrow/h2 heading every other
// top-level tab supplies for itself, for Core's own standalone route.
function TopPrioritySection({ readOnly = false, variant = 'embedded' }) {
  const { priorities, addPriority, updatePriority, deletePriority } = useTopPriorities();
  const { habits, addHabit, deleteHabit, archiveHabit } = useHabits();
  const { logs, getLog, recordLog, updateLogMedia, undoLog } = useHabitLogs();

  const [expandedId, setExpandedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [menuGoalId, setMenuGoalId] = useState(null);
  const [editGoalId, setEditGoalId] = useState(null);
  // { habit, date, log } | null -- the cell a heatmap tap opened,
  // whichever grid (7-day or 12-week history) it came from.
  const [selectedCell, setSelectedCell] = useState(null);

  const atCap = priorities.length >= MAX_TOP_PRIORITIES;
  const expanded = priorities.find((priority) => priority.id === expandedId) || null;
  const editing = priorities.find((priority) => priority.id === editGoalId) || null;
  // GoalDetail's Records Timeline needs archived habits too (their logs
  // still need a name to resolve against, see topPriority.js's
  // normalizeHabit) -- GoalCard's own grid and GoalEditModal's
  // AddHabitForm both stay scoped to "current" habits instead, via
  // editingHabits below.
  const expandedAllHabits = habits.filter((habit) => habit.goalId === expandedId);
  const editingHabits = habits.filter((habit) => habit.goalId === editGoalId && !habit.archivedAt);

  function handleAdd({ commitment }) {
    const record = addPriority({ title: commitment });
    if (record) {
      setIsAddOpen(false);
    }
  }

  function handleAddHabit(goalId, name) {
    addHabit(goalId, name);
  }

  // The one safe "remove" every habit-delete affordance in this module
  // routes through (GoalDetail's own AddHabitForm, GoalEditModal's) --
  // a habit with at least one log gets archived instead of deleted, so
  // its past days keep reading correctly wherever they're looked back
  // on (see topPriority.js's archiveHabit/normalizeHabit). Only a habit
  // with nothing recorded against it is actually removed.
  function handleRemoveHabit(id) {
    const hasRecords = logs.some((log) => log.habitId === id);
    if (hasRecords) {
      archiveHabit(id);
    } else {
      deleteHabit(id);
    }
  }

  function handleSelectCell(habit, date, log) {
    setSelectedCell({ habit, date, log });
  }

  function handleSaveEdit(patch) {
    if (editGoalId) {
      updatePriority(editGoalId, patch);
    }
    setEditGoalId(null);
  }

  // Mirrors ExpandedBucketCard's own handleDelete -- same plain confirm,
  // no bespoke dialog, for the same kind of irreversible removal.
  function handleDeleteGoal(id) {
    if (confirm('Delete this priority?\n\nThis action cannot be undone.')) {
      deletePriority(id);
    }
    setMenuGoalId(null);
  }

  const addIcon = !readOnly && !atCap && (
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
  );

  const heading =
    variant === 'page' ? (
      <div className="section-heading">
        <span className="section-label">Identity</span>
        {addIcon && <div className="section-heading-row priority-heading-row-solo">{addIcon}</div>}
        <p className="core-tagline">Think Big, Act Small</p>
      </div>
    ) : (
      <div className="section-heading-row priority-heading-row">
        <h3>Core</h3>
        {addIcon}
      </div>
    );

  const Wrapper = variant === 'page' ? 'section' : Fragment;
  const wrapperProps = variant === 'page' ? { className: 'app-section', id: 'core-section' } : {};

  return (
    <Wrapper {...wrapperProps}>
      {heading}

      {priorities.length === 0 ? (
        <div className="priority-empty">
          {readOnly ? 'Nothing here yet.' : 'Write your first priority below to start building habits toward it.'}
        </div>
      ) : (
        <div className="priority-list">
          {priorities.map((priority) => {
            const goalHabits = habits.filter((habit) => habit.goalId === priority.id);
            const goalHabitIds = new Set(goalHabits.map((habit) => habit.id));
            // Archived habits still count toward the total -- their
            // logs are exactly as real, only their active-list presence
            // (the grid below) is gone. See topPriority.js's
            // archiveHabit. GoalCard no longer renders this (the "N
            // small acts toward this" line was removed), but the
            // calculation stays wired through in case it's needed again.
            const recordCount = logs.filter((log) => goalHabitIds.has(log.habitId)).length;

            return (
              <GoalCard
                key={priority.id}
                priority={priority}
                habits={goalHabits.filter((habit) => !habit.archivedAt)}
                recordCount={recordCount}
                getLog={getLog}
                onOpen={() => setExpandedId(priority.id)}
                onOpenMenu={setMenuGoalId}
                onSelectCell={handleSelectCell}
                readOnly={readOnly}
              />
            );
          })}
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
              allHabits={expandedAllHabits}
              logs={logs}
              onSelectCell={handleSelectCell}
              onClose={() => setExpandedId(null)}
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

      {!readOnly &&
        createPortal(
          <AnimatePresence>
            {menuGoalId && (
              <GoalCardMenu
                key="goal-card-menu"
                onEdit={() => {
                  setEditGoalId(menuGoalId);
                  setMenuGoalId(null);
                }}
                onDelete={() => handleDeleteGoal(menuGoalId)}
                onClose={() => setMenuGoalId(null)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

      {!readOnly &&
        createPortal(
          <AnimatePresence>
            {editing && (
              <GoalEditModal
                key={editing.id}
                priority={editing}
                habits={editingHabits}
                onAddHabit={handleAddHabit}
                onRemoveHabit={handleRemoveHabit}
                onSave={handleSaveEdit}
                onClose={() => setEditGoalId(null)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </Wrapper>
  );
}

export default TopPrioritySection;
