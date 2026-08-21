import { motion } from 'motion/react';
import ProgressRing from './ProgressRing';
import { spring } from '../../styles/motion';

/*
  Realize's own card -- no vote button, no "+ Add extra" here anymore;
  every goal's money now comes in through the tab's single Log Money
  action (see StrategyPage), so this card is purely a tap target: a ring
  (the number that matters, not a streak), the goal's title, and its
  checklist progress if it has one. `total` is computed once by the
  caller (getTotalProgress) rather than recomputed per card.
*/
function DoingGoalCard({ goal, total, onOpen }) {
  const doneCount = goal.doingChecklist.filter((item) => item.done).length;

  return (
    <motion.article
      className="strategy-goal-card doing-goal-card"
      onClick={onOpen}
      whileHover={{ y: -2, transition: spring.hover }}
      whileTap={{ y: 1, scale: 0.98, transition: spring.press }}
    >
      <div className="strategy-goal-tap-area doing-goal-tap-area">
        <ProgressRing current={total} target={goal.doingGoalAmount} />
        <p className="doing-goal-title">{goal.title}</p>
        {goal.doingChecklist.length > 0 && (
          <p className="doing-checklist-summary">
            {doneCount}/{goal.doingChecklist.length} done
          </p>
        )}
      </div>
    </motion.article>
  );
}

export default DoingGoalCard;
