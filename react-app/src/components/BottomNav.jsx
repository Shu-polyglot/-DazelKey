import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { spring } from '../styles/motion';
import { getInitials } from '../lib/profile';
import { playTapChime } from '../lib/chime';
import {
  NAV_ITEM_COLORS,
  NAV_GLOW_MOVE_TRANSITION,
  NAV_GLOW_COLOR_TRANSITION,
  NAV_GLOW_COLOR_MODE,
  NAV_NAME_FLASH_MS,
  navGlowBackground,
  navGlowShadow,
} from './bottomNavTapEffects';
import './BottomNav.css';

// Layout (position/size) uses the spring; backgroundColor/boxShadow get
// their own tween (see NAV_GLOW_COLOR_TRANSITION) -- Motion's per-key
// transition overrides, so 'crossfade' mode's color tween actually runs
// instead of silently no-op'ing under a spring built for numeric/transform
// values.
const NAV_GLOW_CROSSFADE_TRANSITION = {
  layout: NAV_GLOW_MOVE_TRANSITION,
  backgroundColor: NAV_GLOW_COLOR_TRANSITION,
  boxShadow: NAV_GLOW_COLOR_TRANSITION,
};

const NAV_FLASH_TOTAL_MS = NAV_NAME_FLASH_MS.fadeIn + NAV_NAME_FLASH_MS.hold + NAV_NAME_FLASH_MS.fadeOut;
const NAV_FLASH_TRANSITION = {
  duration: NAV_FLASH_TOTAL_MS / 1000,
  times: [
    0,
    NAV_NAME_FLASH_MS.fadeIn / NAV_FLASH_TOTAL_MS,
    (NAV_NAME_FLASH_MS.fadeIn + NAV_NAME_FLASH_MS.hold) / NAV_FLASH_TOTAL_MS,
    1,
  ],
  ease: 'easeOut',
};

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

// NAV_ITEM_COLORS is keyed by each item's own canonical `route` (e.g.
// 'achievement'), but the app's raw route state can be a `matches` alias
// instead (e.g. 'story') -- this resolves either back to the owning item's
// route so color lookups always hit.
function resolveNavRoute(rawRoute) {
  return NAV_ITEMS.find((item) => item.matches.includes(rawRoute))?.route ?? rawRoute;
}

// Tap-chime fundamental per nav item, left to right -- a C major scale run
// (Do-Re-Mi-Fa-Sol) so tapping across the bar audibly climbs the scale.
// Kept as its own table, keyed by route, so the notes can be retuned
// without touching NAV_ITEMS' routing/labels.
const NAV_CHIME_NOTES = {
  'bucket-lists': 1046.5, // C6
  strategy: 1174.66, // D6
  explore: 1318.51, // E6
  achievement: 1396.91, // F6
  profile: 1567.98, // G6
};

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
  // The full-screen nav-name flash currently playing, if any. The id
  // changes on every tap (even repeat taps on the same item) so the flash
  // remounts -- via its `key` below -- and instantly cancels/replaces
  // whatever was still fading, instead of the two overlapping.
  const [flash, setFlash] = useState(null);

  // Only meaningful in 'snap' color mode (see bottomNavTapEffects.js):
  // holds the departing tab's route until the frame's move finishes, so
  // the color swap can land instantly right as the motion settles rather
  // than tweening alongside it. Unused in 'crossfade' mode.
  const [settledRoute, setSettledRoute] = useState(() => resolveNavRoute(active));

  // Only meaningful in 'crossfade' color mode: the route the frame was on
  // *before* this render, so a freshly-mounted frame knows which color to
  // set as its `initial` (the "from" side of the tween) while `animate`
  // carries it to the newly active tab's color. Updates a render after
  // `active` does, via the effect below, so it still reads as "old" during
  // the render that mounts the new frame. Unused in 'snap' mode.
  const [previousActiveRoute, setPreviousActiveRoute] = useState(() => resolveNavRoute(active));
  useEffect(() => {
    setPreviousActiveRoute(resolveNavRoute(active));
  }, [active]);

  function handleTap(item) {
    // Order matters here: the route (state) updates first, then the chime
    // fires, both synchronously in this one handler -- so React commits
    // the new `active` prop (and starts the frame's layout animation) and
    // the sound starts on the same tick, with nothing deferred to a later
    // frame that could drift the two apart.
    onNavigate(item.route);
    playTapChime(NAV_CHIME_NOTES[item.route]);
    setFlash({ route: item.route, label: item.label, id: `${item.route}-${Date.now()}-${Math.random()}` });
  }

  return (
    <>
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
              onClick={() => handleTap(item)}
              whileTap={{ scale: 0.9, transition: spring.press }}
            >
              <span className="bottom-nav-glow-wrap">
                {isActive &&
                  (NAV_GLOW_COLOR_MODE === 'snap' ? (
                    // 'snap': stay the departing tab's color for the whole
                    // move (a plain `style`, not `animate`, so Motion never
                    // tweens it), then jump to the new color the instant
                    // the layout animation reports done.
                    <motion.span
                      layoutId="bottom-nav-active-glow"
                      className="bottom-nav-active-glow"
                      aria-hidden="true"
                      transition={NAV_GLOW_MOVE_TRANSITION}
                      style={{
                        backgroundColor: navGlowBackground(NAV_ITEM_COLORS[settledRoute].rgb),
                        boxShadow: navGlowShadow(NAV_ITEM_COLORS[settledRoute].rgb),
                      }}
                      onLayoutAnimationComplete={() => setSettledRoute(item.route)}
                    />
                  ) : (
                    // 'crossfade': mount already colored as the departing
                    // tab (`initial`), then tween to the new tab's color
                    // (`animate`) across the same spring as the move.
                    <motion.span
                      layoutId="bottom-nav-active-glow"
                      className="bottom-nav-active-glow"
                      aria-hidden="true"
                      transition={NAV_GLOW_CROSSFADE_TRANSITION}
                      initial={{
                        backgroundColor: navGlowBackground(NAV_ITEM_COLORS[previousActiveRoute].rgb),
                        boxShadow: navGlowShadow(NAV_ITEM_COLORS[previousActiveRoute].rgb),
                      }}
                      animate={{
                        backgroundColor: navGlowBackground(NAV_ITEM_COLORS[item.route].rgb),
                        boxShadow: navGlowShadow(NAV_ITEM_COLORS[item.route].rgb),
                      }}
                    />
                  ))}
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
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Rendered as a sibling of <nav>, not inside it -- .bottom-nav's own
          backdrop-filter would otherwise become this element's containing
          block and trap its position: fixed inside the pill instead of
          the viewport. */}
      {flash && (
        <motion.div
          key={flash.id}
          className="bottom-nav-name-flash"
          aria-hidden="true"
          style={{
            '--nav-flash-color': NAV_ITEM_COLORS[flash.route]?.hex,
            '--nav-flash-rgb': NAV_ITEM_COLORS[flash.route]?.rgb,
          }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={NAV_FLASH_TRANSITION}
          onAnimationComplete={() => setFlash(null)}
        >
          {flash.label}
        </motion.div>
      )}
    </>
  );
}

export default BottomNav;
