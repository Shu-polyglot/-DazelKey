import { motion } from 'motion/react';
import { spring, easing } from '../../styles/motion';

function ArchiveBridge({ onReturnToDashboard, onExploreAhead }) {
  return (
    <motion.div
      className="archive-bridge"
      initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.3, ease: easing.exit } }}
      transition={{ duration: 0.7, delay: 0.1, ease: easing.emphasized }}
    >
      <span className="archive-bridge-eyebrow">What&rsquo;s next</span>
      <h2 className="archive-bridge-headline">The story keeps going.</h2>
      <p className="archive-bridge-copy">
        Your past brought you here. What you do next is still unwritten.
      </p>
      <div className="archive-bridge-actions">
        <motion.button
          type="button"
          className="archive-bridge-secondary"
          onClick={onReturnToDashboard}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          Return to Life OS
        </motion.button>
        <motion.button
          type="button"
          className="archive-bridge-primary"
          onClick={onExploreAhead}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          The Bucket List →
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ArchiveBridge;
