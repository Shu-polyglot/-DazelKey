/*
  Opening Sequence configuration for the Life OS welcome screen.

  Content vs. Presentation are deliberately split:
  - Content (the photo + caption on each card) comes straight from the
    user's own completed, photographed buckets -- see
    pickOpeningAchievements. There is no separate content store here;
    add/complete/delete a bucket with a photo and the Opening reflects
    it automatically.
  - Presentation (which corner a card lands in, when, how big, how
    opaque) lives entirely in this file as pure layout data, indexed by
    how many cards there are. Retune CARD_LAYOUTS/POSITION_PRESETS/timing
    below to change the Opening's composition without touching
    WelcomeStep or the card component.
*/

const MAX_OPENING_CARDS = 6;

function hasPhoto(bucket) {
  return typeof bucket.image === 'string' && bucket.image.trim().length > 0;
}

// Real life moments only -- completed buckets with a photo, most recent
// first, capped at however many the layouts below know how to place.
export function pickOpeningAchievements(buckets) {
  return buckets
    .filter((bucket) => bucket.status === 'completed' && hasPhoto(bucket))
    .sort((a, b) => new Date(b.completedDate || 0) - new Date(a.completedDate || 0))
    .slice(0, MAX_OPENING_CARDS)
    .map((bucket) => ({
      id: bucket.id,
      image: bucket.image,
      caption: (bucket.message && bucket.message.trim()) || bucket.title,
    }));
}

/*
  Where cards land for a given card count. Each tier is hand-placed for
  balance rather than grown by simple append -- e.g. 2 sits left/right,
  3 sits two-up-one-down -- and the exact center is never a valid slot,
  so Life OS/Enter always have a clear safe zone regardless of count.
*/
const CARD_LAYOUTS = {
  1: ['mid-left'],
  2: ['mid-left', 'mid-right'],
  3: ['top-left', 'top-right', 'bottom-center'],
  4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  5: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'mid-left'],
  6: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'mid-left', 'mid-right'],
};

const POSITION_PRESETS = {
  'top-left': { size: 'medium', opacity: 1 },
  'top-right': { size: 'medium', opacity: 1 },
  'bottom-left': { size: 'medium', opacity: 0.96 },
  'bottom-right': { size: 'medium', opacity: 0.96 },
  'mid-left': { size: 'small', opacity: 0.94 },
  'mid-right': { size: 'small', opacity: 0.94 },
  'top-center': { size: 'small', opacity: 0.96 },
  'bottom-center': { size: 'small', opacity: 0.9 },
};

// Pacing: cards step in ~1.15s apart starting at 0.6s, however many
// there are, so the sequence keeps the same unhurried cadence whether
// it's placing two cards or six. Title/CTA follow a fixed gap after the
// last card so the "world fills in, then Life OS arrives" shape holds
// regardless of count. With nothing to show, the title still waits a
// beat behind the backdrop rather than snapping in instantly.
const CARD_START_DELAY = 0.6;
const CARD_STEP = 1.15;
const CARD_DURATION = 2.0;
const TITLE_GAP_AFTER_LAST_CARD = 2.2;
const CTA_GAP_AFTER_TITLE = 1.4;
const EMPTY_TITLE_DELAY = 2.2;

// Builds the presentation (position/timing/size/opacity) for `count`
// cards, plus when the title and CTA should land. Call with
// pickOpeningAchievements(buckets).length and zip the result's `cards`
// array 1:1 with that same achievements array.
export function buildOpeningComposition(count) {
  const cardCount = Math.min(count, MAX_OPENING_CARDS);
  const positions = CARD_LAYOUTS[cardCount] || [];

  const cards = positions.map((position, index) => ({
    position,
    delay: CARD_START_DELAY + index * CARD_STEP,
    duration: CARD_DURATION,
    ...POSITION_PRESETS[position],
  }));

  const titleDelay =
    cardCount > 0 ? CARD_START_DELAY + (cardCount - 1) * CARD_STEP + TITLE_GAP_AFTER_LAST_CARD : EMPTY_TITLE_DELAY;
  const ctaDelay = titleDelay + CTA_GAP_AFTER_TITLE;

  return { cards, titleDelay, ctaDelay };
}
