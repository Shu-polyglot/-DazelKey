import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, animate, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import ArchiveProgressModal from './Modals/ArchiveProgressModal';
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
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Closes the (small, quick) progress modal first so its exit isn't still
  // settling underneath the scroll -- mirrors the delay App.jsx uses after
  // closing the Life Archive, just shorter since this modal is lighter.
  function handleViewRemaining() {
    setIsProgressOpen(false);
    window.setTimeout(() => scrollToSection('bucket-list-section'), 220);
  }

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

      <div className="overview-target">
        <div className="overview-body">
          <motion.button
            type="button"
            className="overview-count-trigger"
            onClick={() => scrollToSection('achievements-section')}
            aria-label={`View ${stats.completed} archived experiences`}
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.98, transition: spring.press }}
          >
            <div className="overview-count">
              <motion.span className="overview-number">{roundedCount}</motion.span>
              <span className="overview-caption">experiences archived</span>
              {stats.inProgress > 0 && <span className="overview-secondary">{stats.inProgress} in motion</span>}
            </div>
          </motion.button>

          <motion.button
            type="button"
            className="ring-trigger"
            onClick={() => setIsProgressOpen(true)}
            aria-label={`View archive progress detail, ${stats.percentage} percent complete`}
            whileHover={{ scale: 1.05, transition: spring.hover }}
            whileTap={{ scale: 0.96, transition: spring.press }}
          >
            <motion.div className="ring" style={{ background: ringBackground }}>
              <motion.span>{percentageLabel}</motion.span>
            </motion.div>
          </motion.button>
        </div>

        <motion.button
          type="button"
          className="overview-invite"
          onClick={onOpenArchive}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.98, transition: spring.press }}
        >
          <span className="overview-invite-label">The Story</span>
          <span className="overview-invite-cta">Watch the story →</span>
        </motion.button>
      </div>

      {createPortal(
        <AnimatePresence>
          {isProgressOpen && (
            <ArchiveProgressModal
              key="archive-progress-modal"
              stats={stats}
              onClose={() => setIsProgressOpen(false)}
              onViewRemaining={handleViewRemaining}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.section>
  );
}

export default OverviewPanel;
