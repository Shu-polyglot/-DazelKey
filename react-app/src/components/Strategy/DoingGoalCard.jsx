import { useMemo } from 'react';
import { motion } from 'motion/react';
import ProgressRing from './ProgressRing';
import { todayIso } from '../../lib/dates';
import { getTotalProgress, formatMoney, getCurrentUnitAmount } from '../../lib/doing';
import { spring } from '../../styles/motion';

/*
  Doing's counterpart to StrategyGoalCard -- same underlying vote engine
  (todaysVote/votedToday work exactly the same way), just a ring instead
  of a grid preview up top, since the number that matters here is money,
  not a streak of days.
*/
function DoingGoalCard({ goal, votes, contributions, onCastVote, onOpenAddExtra, onOpen }) {
  const goalVotes = useMemo(() => votes.filter((vote) => vote.goalId === goal.id), [votes, goal.id]);
  const todaysVote = useMemo(() => goalVotes.find((vote) => vote.date === todayIso()) || null, [goalVotes]);
  const votedToday = Boolean(todaysVote);
  const total = getTotalProgress(goal, votes, contributions);
  const unit = getCurrentUnitAmount(goal.doingUnitHistory);
  const doneCount = goal.doingChecklist.filter((item) => item.done).length;

  return (
    <article className="strategy-goal-card doing-goal-card">
      <div className="strategy-goal-tap-area doing-goal-tap-area" onClick={onOpen}>
        <ProgressRing current={total} target={goal.doingGoalAmount} />
        <p className="doing-goal-title">{goal.title}</p>
        {goal.doingChecklist.length > 0 && (
          <p className="doing-checklist-summary">
            {doneCount}/{goal.doingChecklist.length} done
          </p>
        )}
      </div>

      <div className="strategy-goal-footer doing-goal-footer">
        <motion.button
          type="button"
          className={`primary-button strategy-vote-button${votedToday ? ' is-voted' : ''}`}
          onClick={() => onCastVote(goal.id)}
          disabled={votedToday}
          whileHover={votedToday ? undefined : { y: -1, transition: spring.hover }}
          whileTap={votedToday ? undefined : { y: 1, scale: 0.97, transition: spring.press }}
        >
          {votedToday ? 'Voted today' : `Add ${formatMoney(unit)} today`}
        </motion.button>

        <motion.button
          type="button"
          className="secondary-button"
          onClick={() => onOpenAddExtra(goal.id)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          + Add extra
        </motion.button>
      </div>
    </article>
  );
}

export default DoingGoalCard;
