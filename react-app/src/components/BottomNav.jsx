import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import './BottomNav.css';

// The Story has no tab of its own -- it's reached from within The
// Achievement (see AchievementsShelf's "Story" link) and returns there on
// close -- so it's treated as part of that tab for the active indicator.
const NAV_ITEMS = [
  { route: 'bucket-lists', label: 'The Bucket Lists', matches: ['bucket-lists'] },
  { route: 'achievement', label: 'The Achievement', matches: ['achievement', 'story'] },
  { route: 'profile', label: 'Profile', matches: ['profile'] },
];

function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = item.matches.includes(active);
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
