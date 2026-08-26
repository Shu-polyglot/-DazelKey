import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import DoingGoalCard from './DoingGoalCard';
import DoingGoalDetail from './DoingGoalDetail';
import LogMoneyFlow from './LogMoneyFlow';
import DoingHistoryModal from './DoingHistoryModal';
import AddGoalFlow from './AddGoalFlow';
import BucketListPanel from '../BucketList/BucketListPanel';
import { MAX_DOING_GOALS } from '../../lib/buckets';
import { getTotalProgress } from '../../lib/doing';
import { entranceTransition, spring, transitions } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

// Thin-stroke swap glyph (see BottomNav's own icon-comment for this
// app's line-icon conventions) -- the one always-visible affordance for
// momentum-view-toggle, since its meaning ("tap to switch") has to read
// the same whichever of the two views is currently showing.
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

// Fade + a small vertical settle + blur -- the same enter/exit shape as
// every other content swap in this app (dashboard sections' own entrance,
// BucketStepEditor's step panels), just without that wizard's horizontal
// slide since Bucket Lists/Realize aren't an ordered sequence to move
// "through".
const viewVariants = {
  enter: { opacity: 0, y: 8, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: transitions.exit },
};

function StrategyPage({
  buckets,
  votes,
  contributions,
  onLogMoney,
  onAddDoingGoal,
  onToggleChecklistItem,
  onUpdateBucket,
  onDeleteBucket,
  onCompleteBucket,
  onAddBucket,
  activeView,
  onViewChange,
}) {
  // Drops out once doingCompletedAt is set (100% reached, see App.jsx's
  // checkDoingCompletion) -- the goal itself lives on in `buckets` for
  // DoingHistoryModal to look back up, just no longer "in progress"
  // here. A flagged checklist item going done never sets
  // doingCompletedAt, so it alone can't remove a goal from this list.
  const doingGoals = buckets
    .filter((bucket) => bucket.doingEnabled && !bucket.doingCompletedAt)
    .map((goal) => ({ ...goal, total: getTotalProgress(goal, votes, contributions) }));
  const eligibleBuckets = buckets.filter((bucket) => bucket.status !== 'completed' && !bucket.doingEnabled);
  const atDoingCap = doingGoals.length >= MAX_DOING_GOALS;

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isLogMoneyOpen, setIsLogMoneyOpen] = useState(false);
  const [expandedDoingGoalId, setExpandedDoingGoalId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const expandedDoingGoal = doingGoals.find((goal) => goal.id === expandedDoingGoalId) || null;
  const logMoneyGoals = doingGoals.map((goal) => ({ id: goal.id, title: goal.title, target: goal.doingGoalAmount, current: goal.total }));

  function toggleView() {
    onViewChange(activeView === 'bucket-lists' ? 'realize' : 'bucket-lists');
  }

  return (
    <section className="app-section" id="strategy-section">
      {/*
        No "Identity" eyebrow here -- Core's own tagline+widget section
        (rendered right above this one now that it sits at the top of
        Momentum instead of its own tab, see App.jsx) already carries that
        label, and repeating it immediately below would just look like a
        duplicate heading on the same screen.
      */}
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(0)}
      >
        <div className="section-heading-row">
          <button type="button" className="strategy-history-link" onClick={() => setIsHistoryOpen(true)}>
            History
          </button>
        </div>
      </motion.div>

      {/* Fixed in place above whichever view is showing -- switching
          never moves this button, only the label/destination it names.
          Deliberately one button, not a Bucket Lists/Realize chip pair:
          the label always names where a tap goes next, so it reads as a
          single toggle rather than two tabs. `activeView` is lifted to
          App (not local state) so Archive's "explore ahead" bridge --
          which used to jump straight to the old standalone Bucket Lists
          tab -- can force this toggle onto Bucket Lists before landing
          here, since AnimatePresence's mode="wait" below means the other
          view isn't even mounted while it's not showing. */}
      <motion.button
        type="button"
        className="momentum-view-toggle"
        onClick={toggleView}
        aria-label={`Switch to ${activeView === 'bucket-lists' ? 'Realize' : 'Bucket Lists'}`}
        whileHover={{ y: -1, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        <SwapIcon />
        {activeView === 'bucket-lists' ? 'Realize' : 'Bucket Lists'}
      </motion.button>

      <AnimatePresence mode="wait">
        {activeView === 'bucket-lists' ? (
          <motion.div key="bucket-lists" variants={viewVariants} initial="enter" animate="center" exit="exit">
            <BucketListPanel
              buckets={buckets}
              onUpdate={onUpdateBucket}
              onDelete={onDeleteBucket}
              onComplete={onCompleteBucket}
              onAdd={onAddBucket}
              variant="embedded"
            />
          </motion.div>
        ) : (
          <motion.div key="realize" variants={viewVariants} initial="enter" animate="center" exit="exit">
            <div className="strategy-subsection">
              <div className="section-heading-row realize-heading-row">
                <h3>Realize</h3>
                {!atDoingCap && (
                  <motion.button
                    type="button"
                    className="realize-add-icon"
                    aria-label="Add a Goal"
                    onClick={() => setIsAddGoalOpen(true)}
                    whileHover={{ y: -1, transition: spring.hover }}
                    whileTap={{ y: 1, scale: 0.94, transition: spring.press }}
                  >
                    +
                  </motion.button>
                )}
              </div>

              {doingGoals.length === 0 ? (
                <div className="strategy-empty">Add a goal below to start tracking it in money.</div>
              ) : (
                <>
                  <motion.button
                    type="button"
                    className="primary-button strategy-log-money-button"
                    onClick={() => setIsLogMoneyOpen(true)}
                    whileHover={{ y: -1, transition: spring.hover }}
                    whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
                  >
                    Log Money
                  </motion.button>

                  <div className="strategy-goal-list">
                    {doingGoals.map((goal) => (
                      <DoingGoalCard key={goal.id} goal={goal} total={goal.total} onOpen={() => setExpandedDoingGoalId(goal.id)} />
                    ))}
                  </div>
                </>
              )}

              {atDoingCap && (
                <p className="strategy-goal-limit-note">
                  You're tracking {MAX_DOING_GOALS} goals at once -- complete or remove one to add another.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portaled to escape page-shell's filter-trap, same as every other
          detail modal in this app (see BucketListPanel/AchievementGallery). */}
      {createPortal(
        <AnimatePresence>
          {expandedDoingGoal && (
            <DoingGoalDetail
              key={expandedDoingGoal.id}
              goal={expandedDoingGoal}
              total={expandedDoingGoal.total}
              contributions={contributions}
              onToggleChecklistItem={onToggleChecklistItem}
              onClose={() => setExpandedDoingGoalId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isLogMoneyOpen && logMoneyGoals.length > 0 && (
            <LogMoneyFlow key="log-money" goals={logMoneyGoals} onLogMoney={onLogMoney} onClose={() => setIsLogMoneyOpen(false)} />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isAddGoalOpen && (
            <AddGoalFlow
              key="add-goal"
              eligibleBuckets={eligibleBuckets}
              onSave={(input) => {
                onAddDoingGoal(input);
                setIsAddGoalOpen(false);
              }}
              onClose={() => setIsAddGoalOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isHistoryOpen && (
            <DoingHistoryModal
              key="doing-history"
              buckets={buckets}
              votes={votes}
              contributions={contributions}
              onClose={() => setIsHistoryOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

export default StrategyPage;
