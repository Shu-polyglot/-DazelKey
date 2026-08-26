// Per-tab identity color + shared timing constants for the bottom nav's
// tap effects (the moving highlight frame + the full-screen name flash) --
// kept separate from BottomNav.jsx itself, the same way data/milestoneIdioms.js
// keeps that ritual's content out of its component, so these can be
// retuned without touching layout/rendering logic.

// Each tab's fixed identity color, by route. `rgb` is the bare R,G,B triple
// (no rgba() wrapper) so JS can compose rgba(...) strings at whatever alpha
// it needs -- the same convention as tokens.css's --color-*-rgb variables,
// just resolved in JS since the moving frame's colors are real animatable
// style values (backgroundColor/boxShadow), not custom-property pass-through.
export const NAV_ITEM_COLORS = {
  strategy: { name: 'coral', hex: '#ef6f5e', rgb: '239, 111, 94' }, // Pulse
  explore: { name: 'teal', hex: '#3fb6ac', rgb: '63, 182, 172' },
  achievement: { name: 'violet', hex: '#9b83e0', rgb: '155, 131, 224' }, // Calendar
  profile: { name: 'silver', hex: '#c7ced8', rgb: '199, 206, 216' },
};

// How the active-tab frame gets from its old position to its new one --
// Motion's duration+bounce spring form, so the 300-400ms target and "light
// bounce" feel are both direct knobs here instead of derived from
// stiffness/damping guesswork. Reused for the color crossfade below so
// position and color always land together in that mode.
export const NAV_GLOW_MOVE_TRANSITION = {
  type: 'spring',
  duration: 0.34,
  bounce: 0.22,
};

// Color values (background/box-shadow) don't interpolate meaningfully
// through spring physics the way position/scale do, so 'crossfade' mode
// tweens them on a plain duration+ease instead -- same duration as the
// move above, so they still land together, just via a different curve.
export const NAV_GLOW_COLOR_TRANSITION = {
  duration: NAV_GLOW_MOVE_TRANSITION.duration,
  ease: 'easeOut',
};

// Two ways to land the frame's color when it slides to a new tab -- flip
// this constant to compare them, everything downstream reads from it.
// 'crossfade': the frame's color tweens old -> new across the move itself.
// 'snap': the frame keeps the departing tab's color for the whole move,
//   then swaps instantly the moment the move finishes.
// SWITCH HERE:
export const NAV_GLOW_COLOR_MODE = 'snap'; // 'crossfade' | 'snap'

export function navGlowBackground(rgb) {
  return `rgba(${rgb}, 0.16)`;
}

export function navGlowShadow(rgb) {
  return `0 0 0 1px rgba(${rgb}, 0.45), 0 0 16px 3px rgba(${rgb}, 0.32)`;
}
