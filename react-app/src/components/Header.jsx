import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import './Header.css';

function Header({ title, onAddBucket }) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <div className="brand-mark">LA</div>
        <div className="brand-copy">
          <span className="eyebrow">Life archive</span>
          <h1>{title}</h1>
        </div>
      </div>

      <motion.button
        type="button"
        className="glass-button"
        onClick={onAddBucket}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        + Add to What’s ahead
      </motion.button>
    </header>
  );
}

export default Header;
