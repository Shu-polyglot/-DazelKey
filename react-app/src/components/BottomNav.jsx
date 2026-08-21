import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import { getInitials } from '../lib/profile';
import './BottomNav.css';

// The Story has no tab of its own -- it's reached from within The
// Achievement (see AchievementsShelf's "Story" link) and returns there on
// close -- so it's treated as part of that tab for the active indicator.
const NAV_ITEMS = [
  { route: 'bucket-lists', label: 'The Bucket Lists', matches: ['bucket-lists'] },
  { route: 'strategy', label: 'Momentum', matches: ['strategy'] },
  { route: 'explore', label: 'Explore', matches: ['explore'] },
  { route: 'achievement', label: 'The Achievement', matches: ['achievement', 'story'] },
  { route: 'profile', label: 'Profile', matches: ['profile'] },
];

// Icon-first glyphs in the app's own thin-stroke line style (matches
// public/icons.svg's stroke-width/linecap conventions) -- the filled
// variant is what carries the "selected" read, the same outline-to-solid
// swap Instagram's tab bar uses instead of a text label. Quieter, more
// literary motifs on purpose (a horizon, a line chart, a calendar) --
// the trophy/flag pair this set replaced read too much like a game's
// scoreboard for this app's own cinematic tone.
function BucketListIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M3 18.5 L9 8 L12.3 12.8 L14.6 9.3 L21 18.5 Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// A pulse -- an EKG-style trace, not a trend chart -- for the tab that's
// really about showing up daily rather than a metric going up and to the
// right. The trailing dot (a live monitor's moving cursor) is what
// carries the outline-to-solid "selected" read here, same convention as
// every other glyph's fill.
function StrategyIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <path
        d="M3 12 H7 L10 20 L14 4 L17 12 H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="12" r="1.6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

// Same magnifying-glass metaphor Instagram's own Explore tab uses --
// recognizable at a glance next to icons already borrowed from its
// selected-state language (see the module comment above).
function ExploreIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <circle cx="10.3" cy="10.3" r="6.1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" />
      <path d="M15 15 L20 20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

// A calendar, not a trophy -- The Achievement tab is a record you keep
// (see AchievementsShelf's calendar), not a podium you win, so the glyph
// reads as something accumulated day by day. The frame/rings/header rule
// stay a fixed thin outline; only the one marked date fills solid on
// select, the same single-accent convention StrategyIcon's marker dot
// uses.
function AchievementIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10 H20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 3.5 V7.5 M16 3.5 V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect
        x="10.4"
        y="12.4"
        width="3.2"
        height="3.2"
        rx="0.8"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
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
                {item.route === 'bucket-lists' && <BucketListIcon active={isActive} />}
                {item.route === 'strategy' && <StrategyIcon active={isActive} />}
                {item.route === 'explore' && <ExploreIcon active={isActive} />}
                {item.route === 'achievement' && <AchievementIcon active={isActive} />}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
