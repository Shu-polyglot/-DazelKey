// Timing/layout constants for StoryCarousel's promote/demote morph -- kept
// separate from the component so they're easy to retune without touching
// the render logic.

// Featured <-> thumbnail morph. Based on the bottom nav's active-tab glow
// spring (duration 0.34, bounce 0.22 -- see components/bottomNavTapEffects.js)
// but heavier: a card swings through a much bigger size delta than that
// small glow ring does, so a lower damping ratio here would read as a
// wobbly toy rather than a substantial card settling into place.
export const CARD_MORPH_SPRING = {
  type: 'spring',
  stiffness: 260,
  damping: 34,
  mass: 1.1,
};

// How many upcoming stories show as an overlapping thumbnail stack past
// the featured card's corner.
export const CAROUSEL_THUMBNAIL_COUNT = 3;
