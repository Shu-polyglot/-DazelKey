import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import StrategyGoalCard from './StrategyGoalCard';
import StrategyGoalDetail from './StrategyGoalDetail';
import { entranceTransition } from '../../styles/motion';
import './Strategy.css';

function StrategyPage({ buckets, votes, onCastVote, onMarkMilestone }) {
  const becomeGoals = buckets.filter((bucket) => bucket.goalType === 'become');
  const [expandedGoalId, setExpandedGoalId] = useState(null);
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

      {becomeGoals.length === 0 ? (
        <div className="strategy-empty">
          Add a Become goal from The Bucket List to start voting for who you want to become.
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
    </section>
  );
}

export default StrategyPage;
