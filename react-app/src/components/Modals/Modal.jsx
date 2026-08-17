import { useEffect } from 'react';
import { motion } from 'motion/react';
import { transitions } from '../../styles/motion';
import './Modals.css';

const backdropVariants = {
  hidden: { opacity: 0, transition: transitions.exit },
  visible: { opacity: 1, transition: transitions.standard },
};

const dialogVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)', transition: transitions.exit },
  visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: transitions.emphasis },
};

function Modal({ onClose, children, className = '' }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="modal-backdrop"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div className={`modal ${className}`.trim()} role="dialog" aria-modal="true" variants={dialogVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default Modal;
