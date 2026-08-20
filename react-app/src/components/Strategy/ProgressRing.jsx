import { motion } from 'motion/react';
import { formatMoney, getProgressPercent } from '../../lib/doing';
import { entranceTransition } from '../../styles/motion';

const SIZE = 132;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

/*
  A ring, not a bar, on purpose -- see the requirements this was built
  against. Current amount sits in the center with the target as a small
  line beneath it, exactly the two numbers a Doing goal is actually
  about; the ring itself only ever needs the percent, so the caller can
  pass either raw amounts or an already-computed percent.
*/
function ProgressRing({ current, target }) {
  const percent = getProgressPercent({ doingGoalAmount: target }, current);
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="progress-ring"
      role="img"
      aria-label={`${formatMoney(current)} of ${formatMoney(target)}`}
    >
      <circle cx={CENTER} cy={CENTER} r={RADIUS} className="progress-ring-track" strokeWidth={STROKE} fill="none" />
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        className="progress-ring-value"
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: offset }}
        transition={entranceTransition(0)}
        transform={`rotate(-90 ${CENTER} ${CENTER})`}
      />
      <text x={CENTER} y={CENTER - 3} textAnchor="middle" className="progress-ring-current">
        {formatMoney(current)}
      </text>
      <text x={CENTER} y={CENTER + 15} textAnchor="middle" className="progress-ring-target">
        of {formatMoney(target)}
      </text>
    </svg>
  );
}

export default ProgressRing;
