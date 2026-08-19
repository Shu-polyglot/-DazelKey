import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import { getInitials } from '../lib/profile';
import './BottomNav.css';

// The Story has no tab of its own -- it's reached from within The
// Achievement (see AchievementsShelf's "Story" link) and returns there on
// close -- so it's treated as part of that tab for the active indicator.
const NAV_ITEMS = [
  { route: 'bucket-lists', label: 'The Bucket Lists', matches: ['bucket-lists'] },
  { route: 'achievement', label: 'The Achievement', matches: ['achievement', 'story'] },
  { route: 'profile', label: 'Profile', matches: ['profile'] },
];

// Icon-first glyphs in the app's own thin-stroke line style (matches
// public/icons.svg's stroke-width/linecap conventions) -- the filled
// variant is what carries the "selected" read, the same outline-to-solid
// swap Instagram's tab bar uses instead of a text label.
function BucketListIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path d="M6 21V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <path
        d="M6 4.5 H16.2 C17.35 4.5 17.92 5.88 17.1 6.7 L15 8.8 C14.53 9.27 14.53 10 15 10.47 L17.1 12.57 C17.92 13.4 17.35 14.5 16.2 14.5 H6 Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AchievementIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M6.5 4.5 H17.5 V6.8 C17.5 10.3 15.04 13 12 13 C8.96 13 6.5 10.3 6.5 6.8 Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 5.7 C4.1 5.7 2.9 7.2 2.9 8.6 C2.9 10 3.9 11.3 5.8 11.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M17.5 5.7 C19.9 5.7 21.1 7.2 21.1 8.6 C21.1 10 20.1 11.3 18.2 11.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 13v3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8.8 19.3 L9.7 16.6 H14.3 L15.2 19.3 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function BottomNav({ active, onNavigate, profile }) {
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
            aria-label={item.label}
            onClick={() => onNavigate(item.route)}
            whileTap={{ scale: 0.9, transition: spring.press }}
          >
            {item.route === 'profile' ? (
              <span
                className="bottom-nav-avatar"
                style={profile?.photo ? { backgroundImage: `url(${profile.photo})` } : undefined}
              >
                {!profile?.photo && getInitials(profile?.name)}
              </span>
            ) : (
              <span className="bottom-nav-icon">
                {item.route === 'bucket-lists' ? (
                  <BucketListIcon active={isActive} />
                ) : (
                  <AchievementIcon active={isActive} />
                )}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
