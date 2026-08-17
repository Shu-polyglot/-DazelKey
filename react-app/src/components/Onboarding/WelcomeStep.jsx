import { motion } from 'motion/react';
import { transitions, spring } from '../../styles/motion';

const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { delayChildren: 1, staggerChildren: 0.18 } },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
};

function WelcomeStep({ onEnter }) {
  return (
    <motion.div
      className="opening-content"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <motion.p className="opening-eyebrow" variants={itemVariants}>
        Life OS
      </motion.p>
      <motion.h1 className="opening-title" variants={itemVariants}>
        Welcome to Life OS
      </motion.h1>
      <motion.p className="opening-tagline" variants={itemVariants}>
        Design the life you want to live.
      </motion.p>
      <motion.button
        type="button"
        className="opening-cta"
        variants={itemVariants}
        onClick={onEnter}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        Enter
      </motion.button>
    </motion.div>
  );
}

export default WelcomeStep;
