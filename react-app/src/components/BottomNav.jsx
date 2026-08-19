import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import './BottomNav.css';

const NAV_ITEMS = [
  { route: 'story', label: 'The Story' },
  { route: 'achievement', label: 'The Achievement' },
  { route: 'bucket-lists', label: 'The Bucket Lists' },
  { route: 'timeline', label: 'Your Timeline' },
];

function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.route;
        return (
          <motion.button
            key={item.route}
            type="button"
            className={`bottom-nav-item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate(item.route)}
            whileTap={{ scale: 0.94, transition: spring.press }}
          >
            <span className="bottom-nav-indicator" />
            <span className="bottom-nav-label">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
