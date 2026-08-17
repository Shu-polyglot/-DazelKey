import { motion, useReducedMotion } from 'motion/react';
import { easing } from '../../styles/motion';

/**
 * Atmospheric backdrop for the opening experience — a dusk-over-ocean gradient
 * treatment built from existing design tokens. Structured so a real video or
 * image plate can replace `.cinematic-sky` later without touching layout.
 */
function CinematicBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="cinematic-background" aria-hidden="true">
      <motion.div
        className="cinematic-sky"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: easing.emphasized }}
      />
      <motion.div
        className="cinematic-glow"
        initial={{ opacity: 0, scale: 1 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: [1, 1.08, 1] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 1.8, ease: easing.emphasized }
            : {
                opacity: { duration: 1.8, ease: easing.emphasized },
                scale: { duration: 24, ease: 'easeInOut', repeat: Infinity },
              }
        }
      />
      <motion.div
        className="cinematic-horizon"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.4, ease: easing.emphasized }}
      />
      <div className="cinematic-vignette" />
    </div>
  );
}

export default CinematicBackground;
