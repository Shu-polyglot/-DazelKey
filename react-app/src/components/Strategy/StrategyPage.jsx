import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import DoingGoalCard from './DoingGoalCard';
import DoingGoalDetail from './DoingGoalDetail';
import LogMoneyFlow from './LogMoneyFlow';
import DoingHistoryModal from './DoingHistoryModal';
import AddGoalFlow from './AddGoalFlow';
import TopPrioritySection from '../../features/topPriority/TopPrioritySection';
import { MAX_DOING_GOALS } from '../../lib/buckets';
import { getTotalProgress } from '../../lib/doing';
import { entranceTransition, spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

const VIEWS = [
  { id: 'priority', label: 'Core' },
  { id: 'realize', label: 'Realize' },
];

function StrategyPage({ buckets, votes, contributions, onLogMoney, onAddDoingGoal, onToggleChecklistItem }) {
  const [view, setView] = useState('priority');
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
          <h2>Momentum</h2>
          <button type="button" className="strategy-history-link" onClick={() => setIsHistoryOpen(true)}>
            History
          </button>
        </div>
      </motion.div>

      <div className="strategy-tabs" role="tablist" aria-label="Momentum view">
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

      {view === 'priority' ? (
        <TopPrioritySection />
      ) : (
        <>
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
