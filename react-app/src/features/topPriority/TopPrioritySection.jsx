import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import GoalCard from './GoalCard';
import YearProgressWidget from './YearProgressWidget';
import GoalCardMenu from './GoalCardMenu';
import GoalEditModal from './GoalEditModal';
import GoalDetail from './GoalDetail';
import AddPriorityFlow from './AddPriorityFlow';
import ActionRecordModal from './ActionRecordModal';
import { useTopPriorities, useHabits, useHabitLogs, usePriorityActions, MAX_TOP_PRIORITIES } from './topPriority';
import { spring } from '../../styles/motion';
import './topPriority.css';

/*
  Core (formerly "Top 3 Priority"), end to end: goals (its own data
  store, capped at MAX_TOP_PRIORITIES) and Actions -- free-form photo/
  journal records against a goal, any number of times (see topPriority.js
  for both stores). Goals carry no vote/milestone/progress data of their
  own. Editing (title/commitment only) lives entirely behind a goal
  card's long-press menu (GoalCardMenu -> GoalEditModal); tapping a card
  instead opens GoalDetail, a read-only look back via Records Timeline.
  This component needs nothing handed down from Strategy to run
  standalone. (Internal module/route names stay "topPriority"/
  "priority" on purpose -- only the user-facing label changed.)

  useHabits/useHabitLogs are still imported here, read-only, purely to
  keep the cumulative recordCount calculation below alive without
  erroring -- see topPriority.js's own header comment for why that data
  (and this calculation) stays even though habits have no UI anymore.
*/
// `variant`: 'embedded' (default) renders just Core's own sub-heading
// (h3 + add icon), no outer page chrome -- for dropping into another
// page's own section (Momentum's toggle before the Core/Bucket Lists
// swap, PreviewProfile's shared-profile stack today). 'page' wraps that
// same content in the app-section/eyebrow/h2 heading every other
// top-level tab supplies for itself, for Core's own standalone route.
function TopPrioritySection({ readOnly = false, variant = 'embedded' }) {
  const { priorities, addPriority, updatePriority, deletePriority } = useTopPriorities();
  const { habits } = useHabits();
  const { logs } = useHabitLogs();
  const { actions, addAction, updateAction, deleteAction } = usePriorityActions();

  const [expandedId, setExpandedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [menuGoalId, setMenuGoalId] = useState(null);
  const [editGoalId, setEditGoalId] = useState(null);
  // Set by GoalCard's own "Action" button -- the goal a fresh Action is
  // being recorded against (ActionRecordModal in create mode).
  const [recordingGoalId, setRecordingGoalId] = useState(null);
  // Set by tapping a Records Timeline entry -- the existing Action being
  // looked back on (ActionRecordModal in view/edit mode). Mutually
  // exclusive with recordingGoalId in practice: each is only ever set by
  // its own, separate tap target.
  const [viewingAction, setViewingAction] = useState(null);

  const atCap = priorities.length >= MAX_TOP_PRIORITIES;
  const expanded = priorities.find((priority) => priority.id === expandedId) || null;
  const editing = priorities.find((priority) => priority.id === editGoalId) || null;
  const expandedActions = actions.filter((action) => action.goalId === expandedId);

  const actionModalGoalId = viewingAction ? viewingAction.goalId : recordingGoalId;
  const actionModalPriority = priorities.find((priority) => priority.id === actionModalGoalId) || null;

  function handleAdd({ commitment }) {
    const record = addPriority({ title: commitment });
    if (record) {
      setIsAddOpen(false);
    }
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

  function closeActionModal() {
    setRecordingGoalId(null);
    setViewingAction(null);
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

      {variant === 'page' && <YearProgressWidget />}

      {priorities.length === 0 ? (
        <div className="priority-empty">
          {readOnly ? 'Nothing here yet.' : 'Write your first priority below, then record Actions toward it any time.'}
        </div>
      ) : (
        <div className="priority-list">
          {priorities.map((priority) => {
            // Retired habit-tracking data (see this file's own header
            // comment) -- GoalCard doesn't destructure recordCount, same
            // as before habits lost their UI, so this stays alive and
            // provably error-free without anything actually rendering it.
            const goalHabitIds = new Set(habits.filter((habit) => habit.goalId === priority.id).map((habit) => habit.id));
            const recordCount = logs.filter((log) => goalHabitIds.has(log.habitId)).length;

            return (
              <GoalCard
                key={priority.id}
                priority={priority}
                recordCount={recordCount}
                onOpen={() => setExpandedId(priority.id)}
                onOpenMenu={setMenuGoalId}
                onAddAction={setRecordingGoalId}
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
              actions={expandedActions}
              onSelectAction={setViewingAction}
              onClose={() => setExpandedId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {actionModalPriority && (
            <ActionRecordModal
              key="action-record-modal"
              priorityTitle={actionModalPriority.title}
              action={viewingAction}
              readOnly={readOnly}
              onRecord={(media) => addAction(recordingGoalId, media)}
              onUpdateMedia={(media) => viewingAction && updateAction(viewingAction.id, media)}
              onDelete={() => viewingAction && deleteAction(viewingAction.id)}
              onClose={closeActionModal}
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
            {editing && <GoalEditModal key={editing.id} priority={editing} onSave={handleSaveEdit} onClose={() => setEditGoalId(null)} />}
          </AnimatePresence>,
          document.body,
        )}
    </Wrapper>
  );
}

export default TopPrioritySection;
