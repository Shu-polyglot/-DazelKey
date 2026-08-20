import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import StrategyGoalCard from './StrategyGoalCard';
import StrategyGoalDetail from './StrategyGoalDetail';
import DoingGoalCard from './DoingGoalCard';
import DoingGoalDetail from './DoingGoalDetail';
import DoingAddExtraModal from './DoingAddExtraModal';
import AddGoalFlow from './AddGoalFlow';
import RadarChart from './RadarChart';
import TraitPicker from './TraitPicker';
import Modal from '../Modals/Modal';
import { DIMENSIONS } from '../../data/traits';
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
  onActivateTrait,
  onCastDoingVote,
  onAddDoingExtra,
  onAddDoingGoal,
  onToggleChecklistItem,
  onUpdateDoingUnit,
}) {
  const [view, setView] = useState('becoming');
  const becomeGoals = buckets.filter((bucket) => bucket.goalType === 'become');
  const doingGoals = buckets.filter((bucket) => bucket.goalType === 'have' && bucket.doingEnabled);
  const eligibleBuckets = buckets.filter(
    (bucket) => bucket.goalType === 'have' && bucket.status !== 'completed' && !bucket.doingEnabled,
  );
  const activeTraitNames = new Set(becomeGoals.map((goal) => goal.title));

  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [isAddTraitOpen, setIsAddTraitOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [addExtraGoalId, setAddExtraGoalId] = useState(null);
  const [expandedDoingGoalId, setExpandedDoingGoalId] = useState(null);

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
        <h2>Strategy</h2>
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
          <RadarChart buckets={buckets} votes={votes} />

          {becomeGoals.length === 0 ? (
            <div className="strategy-empty">Activate a trait below to start voting for who you want to become.</div>
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

          <motion.button
            type="button"
            className="secondary-button strategy-add-trait-button"
            onClick={() => setIsAddTraitOpen(true)}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
          >
            + Add a Trait
          </motion.button>
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

          <motion.button
            type="button"
            className="secondary-button strategy-add-trait-button"
            onClick={() => setIsAddGoalOpen(true)}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
          >
            + Add a Goal
          </motion.button>
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
          {isAddTraitOpen && (
            <Modal key="add-trait" onClose={() => setIsAddTraitOpen(false)} className="detail-modal">
              <div className="modal-header detail-header">
                <h3>Add a Trait</h3>
                <motion.button
                  type="button"
                  className="icon-button"
                  aria-label="Close"
                  onClick={() => setIsAddTraitOpen(false)}
                  whileHover={{ rotate: 90, transition: spring.hover }}
                  whileTap={{ scale: 0.88, transition: spring.press }}
                >
                  ×
                </motion.button>
              </div>
              <TraitPicker dimensions={DIMENSIONS} activeTraitNames={activeTraitNames} onActivate={onActivateTrait} />
            </Modal>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

export default StrategyPage;
