import { useEffect, useMemo, useRef } from 'react';
import { motion, animate, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { dashboardEntrance, entranceTransition, easing, spring } from '../styles/motion';
import './OverviewPanel.css';

function OverviewPanel({ buckets, onOpenArchive }) {
  const stats = useMemo(() => {
    const completed = buckets.filter((bucket) => bucket.status === 'completed').length;
    const inProgress = buckets.filter((bucket) => bucket.status === 'in-progress').length;
    const total = buckets.length;
    const percentage = total ? Math.round((completed / total) * 100) : 0;

    return { completed, inProgress, total, percentage };
  }, [buckets]);

  const prefersReducedMotion = useReducedMotion();
  const countValue = useMotionValue(0);
  const roundedCount = useTransform(countValue, (v) => Math.round(v));
  const percentageValue = useMotionValue(0);
  const roundedPercentage = useTransform(percentageValue, (v) => Math.round(v));
  const percentageLabel = useTransform(roundedPercentage, (v) => `${v}%`);
  const ringBackground = useTransform(
    roundedPercentage,
    (v) => `conic-gradient(var(--color-accent) 0 ${v}%, rgba(var(--color-mist-rgb), 0.12) ${v}% 100%)`,
  );
  const hasAnimatedRef = useRef(false);

  // Ties to the dashboard's entrance sequence on first mount, then reacts
  // promptly (no delay) to later, meaningful changes to the stats.
  useEffect(() => {
    const isFirstRun = !hasAnimatedRef.current;
    hasAnimatedRef.current = true;

    if (prefersReducedMotion) {
      countValue.set(stats.completed);
      percentageValue.set(stats.percentage);
      return undefined;
    }

    const delay = isFirstRun ? dashboardEntrance.progress : 0;
    const countControls = animate(countValue, stats.completed, { duration: 0.7, delay, ease: easing.standard });
    const percentControls = animate(percentageValue, stats.percentage, {
      duration: 0.8,
      delay,
      ease: easing.standard,
    });

    return () => {
      countControls.stop();
      percentControls.stop();
    };
  }, [stats.completed, stats.percentage, prefersReducedMotion, countValue, percentageValue]);

  return (
    <motion.section
      className="panel overview-panel"
      id="archive-section"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(dashboardEntrance.overview)}
    >
      <p className="panel-label">Archive overview</p>

      <motion.button
        type="button"
        className="overview-target"
        onClick={onOpenArchive}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.98, transition: spring.press }}
      >
        <div className="overview-body">
          <div className="overview-count">
            <motion.span className="overview-number">{roundedCount}</motion.span>
            <span className="overview-caption">experiences archived</span>
            {stats.inProgress > 0 && <span className="overview-secondary">{stats.inProgress} in motion</span>}
          </div>

          <motion.div
            className="ring"
            style={{ background: ringBackground }}
            aria-label={`${stats.percentage} percent of the archive complete`}
          >
            <motion.span>{percentageLabel}</motion.span>
          </motion.div>
        </div>

        <div className="overview-invite">
          <span className="overview-invite-label">What you’ve lived</span>
          <span className="overview-invite-cta">Learn more →</span>
        </div>
      </motion.button>
    </motion.section>
  );
}

export default OverviewPanel;
