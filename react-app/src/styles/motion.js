/*
  Motion tokens for Motion for React (`motion/react`).
  These are the only building blocks future components should reach for —
  no component should invent its own duration or easing curve.

  Two motion "families":
  - duration/easing pairs, for fades, lifts, and enter/exit transitions
  - spring configs, for anything that responds to direct touch (press, drag)

  The guiding rule: hover invites (small, eased movement), press responds
  (spring, slightly compressed), enter/exit settles (eased, no bounce).
*/

export const duration = {
  micro: 0.12, // hover / small state changes
  standard: 0.2, // general UI transitions
  emphasis: 0.36, // enter animations, larger reveals
};

export const easing = {
  standard: [0.4, 0, 0.2, 1], // even, controlled deceleration
  emphasized: [0.16, 1, 0.3, 1], // strong settle-in, used for entrances
  exit: [0.4, 0, 1, 1], // accelerates out, exits should feel quick
};

export const spring = {
  press: { type: 'spring', stiffness: 500, damping: 30, mass: 0.8 },
  soft: { type: 'spring', stiffness: 260, damping: 28, mass: 1 },
  hover: { type: 'spring', stiffness: 380, damping: 22, mass: 0.6 }, // quick, light lift toward the cursor
  commit: { type: 'spring', stiffness: 420, damping: 20, mass: 0.9 }, // slightly looser — for the one "I did this" action
};

export const transitions = {
  micro: { duration: duration.micro, ease: easing.standard },
  standard: { duration: duration.standard, ease: easing.standard },
  emphasis: { duration: duration.emphasis, ease: easing.emphasized },
  exit: { duration: duration.standard, ease: easing.exit },
  press: spring.press,
};

/*
  Dashboard entrance choreography — the one place that owns "when does
  each section wake up" so the sequence reads as a single environment
  coming to life, not each component picking its own timing. Sections
  read a delay from here; list items (achievements, bucket cards) add
  a small per-index stagger on top, capped so a long list doesn't drag
  the sequence out.
*/
export const dashboardEntrance = {
  header: 0.12,
  overview: 0.24,
  progress: 0.4,
  nextUp: 0.48,
  achievements: 0.56,
  bucketList: 0.62,
  calendar: 0.74,
};

export const entranceStagger = 0.05;
export const entranceStaggerCap = 0.25;

export function staggerDelay(baseDelay, index) {
  return baseDelay + Math.min(index * entranceStagger, entranceStaggerCap);
}

export function entranceTransition(delay = 0, overrides = {}) {
  return { duration: 0.55, delay, ease: easing.emphasized, ...overrides };
}
