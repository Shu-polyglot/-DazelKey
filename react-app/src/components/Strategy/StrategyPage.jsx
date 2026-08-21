import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import StrategyGoalCard from './StrategyGoalCard';
import StrategyGoalDetail from './StrategyGoalDetail';
import DoingGoalCard from './DoingGoalCard';
import DoingGoalDetail from './DoingGoalDetail';
import DoingAddExtraModal from './DoingAddExtraModal';
import DoingHistoryModal from './DoingHistoryModal';
import AddGoalFlow from './AddGoalFlow';
import AddBecomeFlow from './AddBecomeFlow';
import { MAX_BECOME_GOALS, MAX_DOING_GOALS } from '../../lib/buckets';
import { entranceTransition, spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

const VIEWS = [
  { id: 'becoming', label: 'Becoming' },
  { id: 'doing', label: 'Doing' },
];

function StrategyPage({
  buckets,
  votes,
  contributions,
  onCastVote,
  onMarkMilestone,
  onAddBecomeGoal,
  onCastDoingVote,
  onAddDoingExtra,
  onAddDoingGoal,
  onToggleChecklistItem,
  onUpdateDoingUnit,
}) {
  const [view, setView] = useState('becoming');
  const becomeGoals = buckets.filter((bucket) => bucket.goalType === 'become');
  // Drops out once doingCompletedAt is set (100% reached, see App.jsx's
  // checkDoingCompletion) -- the goal itself lives on in `buckets` for
  // DoingHistoryModal to look back up, just no longer "in progress"
  // here. A flagged checklist item going done never sets
  // doingCompletedAt, so it alone can't remove a goal from this list.
  const doingGoals = buckets.filter((bucket) => bucket.goalType === 'have' && bucket.doingEnabled && !bucket.doingCompletedAt);
  const eligibleBuckets = buckets.filter(
    (bucket) => bucket.goalType === 'have' && bucket.status !== 'completed' && !bucket.doingEnabled,
  );
  const atBecomeCap = becomeGoals.length >= MAX_BECOME_GOALS;
  const atDoingCap = doingGoals.length >= MAX_DOING_GOALS;

  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [isAddBecomeOpen, setIsAddBecomeOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [addExtraGoalId, setAddExtraGoalId] = useState(null);
  const [expandedDoingGoalId, setExpandedDoingGoalId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const expandedGoal = becomeGoals.find((goal) => goal.id === expandedGoalId) || null;
  const expandedDoingGoal = doingGoals.find((goal) => goal.id === expandedDoingGoalId) || null;
  const addExtraGoal = doingGoals.find((goal) => goal.id === addExtraGoalId) || null;

  return (
    <section className="app-section" id="strategy-section">
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(0)}
      >
        <span className="section-label">Identity</span>
        <div className="section-heading-row">
          <h2>Strategy</h2>
          <button type="button" className="strategy-history-link" onClick={() => setIsHistoryOpen(true)}>
            History
          </button>
        </div>
      </motion.div>

      <div className="strategy-tabs" role="tablist" aria-label="Strategy view">
        {VIEWS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            className={`strategy-tab${view === tab.id ? ' is-active' : ''}`}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
            {view === tab.id && <motion.span className="strategy-tab-indicator" layoutId="strategy-tab-indicator" transition={spring.soft} />}
          </button>
        ))}
      </div>

      {view === 'becoming' ? (
        <>
          {becomeGoals.length === 0 ? (
            <div className="strategy-empty">Write your first goal below to start voting for who you're becoming.</div>
          ) : (
            <div className="strategy-goal-list">
              {becomeGoals.map((goal) => (
                <StrategyGoalCard
                  key={goal.id}
                  goal={goal}
                  votes={votes}
                  onCastVote={onCastVote}
                  onMarkMilestone={onMarkMilestone}
                  onOpen={() => setExpandedGoalId(goal.id)}
                />
              ))}
            </div>
          )}

          {atBecomeCap ? (
            <p className="strategy-goal-limit-note">
              You're focusing on {MAX_BECOME_GOALS} at a time -- complete or remove one to add another.
            </p>
          ) : (
            <motion.button
              type="button"
              className="secondary-button strategy-add-trait-button"
              onClick={() => setIsAddBecomeOpen(true)}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
            >
              + Add a Goal
            </motion.button>
          )}
        </>
      ) : (
        <>
          {doingGoals.length === 0 ? (
            <div className="strategy-empty">Add a goal below to start tracking it in money.</div>
          ) : (
            <div className="strategy-goal-list">
              {doingGoals.map((goal) => (
                <DoingGoalCard
                  key={goal.id}
                  goal={goal}
                  votes={votes}
                  contributions={contributions}
                  onCastVote={onCastDoingVote}
                  onOpenAddExtra={setAddExtraGoalId}
                  onOpen={() => setExpandedDoingGoalId(goal.id)}
                />
              ))}
            </div>
          )}

          {atDoingCap ? (
            <p className="strategy-goal-limit-note">
              You're tracking {MAX_DOING_GOALS} goals at once -- complete or remove one to add another.
            </p>
          ) : (
            <motion.button
              type="button"
              className="secondary-button strategy-add-trait-button"
              onClick={() => setIsAddGoalOpen(true)}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
            >
              + Add a Goal
            </motion.button>
          )}
        </>
      )}

      {/* Portaled to escape page-shell's filter-trap, same as every other
          detail modal in this app (see BucketListPanel/AchievementGallery). */}
      {createPortal(
        <AnimatePresence>
          {expandedGoal && (
            <StrategyGoalDetail
              key={expandedGoal.id}
              goal={expandedGoal}
              votes={votes.filter((vote) => vote.goalId === expandedGoal.id)}
              onClose={() => setExpandedGoalId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {expandedDoingGoal && (
            <DoingGoalDetail
              key={expandedDoingGoal.id}
              goal={expandedDoingGoal}
              votes={votes.filter((vote) => vote.goalId === expandedDoingGoal.id)}
              contributions={contributions}
              onToggleChecklistItem={onToggleChecklistItem}
              onUpdateUnit={onUpdateDoingUnit}
              onClose={() => setExpandedDoingGoalId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {addExtraGoal && (
            <DoingAddExtraModal
              key="add-extra"
              goal={addExtraGoal}
              onAddExtra={onAddDoingExtra}
              onClose={() => setAddExtraGoalId(null)}
            />
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

      {createPortal(
        <AnimatePresence>
          {isAddBecomeOpen && (
            <AddBecomeFlow
              key="add-become"
              onSave={(input) => {
                onAddBecomeGoal(input);
                setIsAddBecomeOpen(false);
              }}
              onClose={() => setIsAddBecomeOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

export default StrategyPage;
