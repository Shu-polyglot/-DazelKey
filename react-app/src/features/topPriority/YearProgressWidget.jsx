import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getYearDayProgress, getMonthBoundaryPercentages } from '../../lib/dates';
import { transitions, spring } from '../../styles/motion';

// How often the widget re-reads the clock while mounted -- frequent
// enough that the fill visibly (if gently) creeps forward if someone
// lingers on this page, without re-rendering so often it costs anything
// or reads as a busy, ticking countdown rather than a calm ambient one.
const REFRESH_INTERVAL_MS = 60_000;

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const captionVariants = {
  enter: { opacity: 0, y: -4 },
  center: { opacity: 1, y: 0, transition: transitions.standard },
  exit: { opacity: 0, y: 4, transition: transitions.exit },
};

/*
  Core page's own "20XX is Y% done." widget. Two things now make it read
  as time actually passing rather than a fixed snapshot taken once at
  load:
   - the fill's width uses sub-day precision (precisePercentage, see
     lib/dates) and re-reads the clock every REFRESH_INTERVAL_MS, so it
     visibly creeps forward the longer this page stays open. Motion
     tweens each step (transitions.emphasis) instead of snapping, so a
     refresh reads as a nudge forward, not a jump cut.
   - tapping the caption flips it between "Day X of Y" (looking back at
     how far you've come) and "N days left in <year>" (looking forward
     at what's left) -- the same fact, either direction, a crossfade
     away.
  Month-boundary ticks still stand in for the old one-box-per-day grid
  (see git history) -- that grid's density read as trypophobia-
  triggering no matter how it was spaced/sized.
*/
function YearProgressWidget() {
  const [progress, setProgress] = useState(() => getYearDayProgress());
  const [showDaysLeft, setShowDaysLeft] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setProgress(getYearDayProgress()), REFRESH_INTERVAL_MS);
    // Backgrounded tabs throttle setInterval (browsers cap or pause timers
    // once document.hidden is true), so the fill can sit stale for however
    // long this tab was in the background -- catch it up the instant
    // someone actually looks at it again instead of waiting on whatever's
    // left of the throttled interval.
    function handleVisibilityChange() {
      if (!document.hidden) {
        setProgress(getYearDayProgress());
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const { year, totalDays, elapsedDays, percentage, precisePercentage } = progress;
  const daysLeft = totalDays - elapsedDays;
  const monthTickPositions = getMonthBoundaryPercentages(year, totalDays);

  return (
    <div className="year-progress-widget">
      <div className="year-progress-header">
        <p className="year-progress-heading">
          {year} is {percentage}% done.
        </p>
        <motion.button
          type="button"
          className="year-progress-caption"
          onClick={() => setShowDaysLeft((prev) => !prev)}
          aria-label={showDaysLeft ? 'Show day count instead' : 'Show days remaining this year instead'}
          {...tapProps}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showDaysLeft ? (
              <motion.span key="left" variants={captionVariants} initial="enter" animate="center" exit="exit">
                {daysLeft} day{daysLeft === 1 ? '' : 's'} left in {year}
              </motion.span>
            ) : (
              <motion.span key="count" variants={captionVariants} initial="enter" animate="center" exit="exit">
                Day {elapsedDays} of {totalDays}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="year-progress-bar-track">
        <motion.div
          className="year-progress-bar-fill"
          animate={{ width: `${precisePercentage}%` }}
          transition={transitions.emphasis}
        />
        <div className="year-progress-bar-ticks" aria-hidden="true">
          {monthTickPositions.map((pct, index) => (
            <span key={index} className="year-progress-bar-tick" style={{ left: `${pct}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default YearProgressWidget;
