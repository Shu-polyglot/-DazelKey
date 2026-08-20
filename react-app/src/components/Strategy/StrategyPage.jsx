import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import StrategyGoalCard from './StrategyGoalCard';
import StrategyGoalDetail from './StrategyGoalDetail';
import RadarChart from './RadarChart';
import TraitPicker from './TraitPicker';
import Modal from '../Modals/Modal';
import { DIMENSIONS } from '../../data/traits';
import { entranceTransition, spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

function StrategyPage({ buckets, votes, onCastVote, onMarkMilestone, onActivateTrait }) {
  const becomeGoals = buckets.filter((bucket) => bucket.goalType === 'become');
  const activeTraitNames = new Set(becomeGoals.map((goal) => goal.title));
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [isAddTraitOpen, setIsAddTraitOpen] = useState(false);
  const expandedGoal = becomeGoals.find((goal) => goal.id === expandedGoalId) || null;

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

      <RadarChart buckets={buckets} votes={votes} />

      {becomeGoals.length === 0 ? (
        <div className="strategy-empty">
          Activate a trait below to start voting for who you want to become.
        </div>
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
