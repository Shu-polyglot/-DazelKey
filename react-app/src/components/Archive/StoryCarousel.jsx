import { AnimatePresence, motion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { archiveContentVariants, spring } from '../../styles/motion';
import { CARD_MORPH_SPRING, CAROUSEL_THUMBNAIL_COUNT } from './storyCarouselEffects';

function eyebrowFor(story) {
  if (story.type === 'together') return 'Together';
  if (story.type === 'memory') return 'A memory';
  return 'An achievement';
}

function gradientStyle(story) {
  const seed = story.media?.seed || { angle: 160, shift: 12 };
  return {
    backgroundImage:
      `radial-gradient(ellipse 90% 60% at ${30 + seed.shift}% 20%, rgba(var(--color-glow-rgb), 0.4), transparent 60%), ` +
      `radial-gradient(ellipse 70% 55% at ${80 - seed.shift}% 78%, rgba(var(--color-glow-bright-rgb), 0.22), transparent 60%), ` +
      `linear-gradient(${seed.angle}deg, #10192c 0%, #05070d 75%)`,
  };
}

function mediaStyleFor(story) {
  return story.media?.kind === 'photo' ? { backgroundImage: `url(${story.media.src})` } : gradientStyle(story);
}

/*
  One card's morphing shape -- shared between its featured and thumbnail
  renderings via `layoutId`. The outer element owns position/size/radius
  (what Motion's shared layout animation actually FLIPs between); the inner
  `layout` (no id) media div exists purely so Motion applies its own
  counter-scale correction to it, keeping the photo/gradient looking
  proportionally cropped instead of visibly stretching non-uniformly while
  a landscape-ish featured card and a near-square thumbnail trade places.
*/
function StoryCard({ story, isFeatured, slot, onSelect }) {
  // Featured and every thumbnail are rendered as direct siblings under the
  // same parent (.story-carousel-stage) -- never nested in an extra
  // per-role wrapper -- and always the same element type (a div). Both
  // choices matter for the same reason: Motion's shared `layoutId` FLIP
  // needs to recognize this as one persistent thing changing role/position
  // across a render, not two different elements in two different trees;
  // an extra wrapper level or a tag swap (div <-> button) between roles
  // was enough to make it just teleport instead of animate.
  return (
    <motion.div
      layoutId={`card-${story.id}`}
      className={`story-carousel-card${isFeatured ? ' is-featured' : ' is-thumbnail'}`}
      style={isFeatured ? undefined : { '--slot': slot }}
      transition={CARD_MORPH_SPRING}
      onClick={isFeatured ? undefined : onSelect}
      onKeyDown={
        isFeatured
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect();
              }
            }
      }
      role={isFeatured ? undefined : 'button'}
      tabIndex={isFeatured ? undefined : 0}
      aria-label={isFeatured ? undefined : `Show ${story.headline}`}
      whileTap={isFeatured ? undefined : { scale: 0.94, transition: spring.press }}
    >
      <motion.div layout className="story-carousel-media" style={mediaStyleFor(story)}>
        <div className="story-carousel-scrim" aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

/*
  The featured card's title/caption/CTA -- deliberately NOT a child of the
  morphing StoryCard above. Keeping it a separate, plain crossfade (keyed by
  story id, so a new one always fades in only after the last one fully
  fades out) means the text never has to reflow/follow the card's own
  position-and-size FLIP -- it just holds still in the featured slot and
  swaps content, which is what keeps it from flickering or reading as
  "dragged" during the morph.
*/
function StoryCardText({ story, onCta }) {
  const isNow = story.type === 'now';
  const hasMeta = !isNow && (story.place || story.date);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={story.id}
        className={`story-carousel-text${isNow ? ' is-now' : ''}`}
        variants={archiveContentVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <span className="story-carousel-eyebrow">{isNow ? 'Right now' : eyebrowFor(story)}</span>
        <h2 className="story-carousel-headline">{story.headline}</h2>
        {story.caption && (
          <p className="story-carousel-caption">{isNow ? story.caption : `“${story.caption}”`}</p>
        )}
        {hasMeta && (
          <div className="story-carousel-meta">
            {story.place && <span>{story.place}</span>}
            {story.date && <span>{formatDate(story.date)}</span>}
          </div>
        )}
        <motion.button
          type="button"
          className="story-carousel-cta"
          onClick={onCta}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          {isNow ? 'Return' : 'Discover'}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

function ArrowIcon({ direction }) {
  const d = direction === 'prev' ? 'M14.5 5 L8 12 L14.5 19' : 'M9.5 5 L16 12 L9.5 19';
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/*
  Featured card + an overlapping thumbnail stack of the next few stories,
  in the "interactive card opening" style: tapping a thumbnail (or the
  arrows/pagination) promotes it to featured while the outgoing featured
  card demotes into the stack, both driven by the same shared `layoutId`
  per story (see StoryCard) so Motion animates the swap as one continuous
  move rather than a cut. Replaces the old auto-advancing dissolve-through
  Story viewer -- this is a manual, browse-at-your-own-pace carousel, so
  there's no timer/progress-fill here, just the pagination dots below.
*/
function StoryCarousel({ stories, activeIndex, onSelect, onNext, onPrev }) {
  const activeStory = stories[activeIndex];

  // Every other story, up to the stack's capacity, in their original
  // (oldest -> newest) order -- NOT just "the next few after active".
  // Restricting to "after active" meant advancing forward dropped the
  // just-demoted featured card off the back of the window entirely (it
  // never got a slot to settle into, only disappeared) instead of
  // reappearing in the stack the way a promote/demote swap requires.
  const thumbnails = [];
  for (let i = 0; i < stories.length && thumbnails.length < CAROUSEL_THUMBNAIL_COUNT; i += 1) {
    if (i !== activeIndex) {
      thumbnails.push({ story: stories[i], index: i, slot: thumbnails.length });
    }
  }

  return (
    <div className="story-carousel">
      <div className="story-carousel-stage">
        {/* `key` here is load-bearing: without it, React treats every
            featured story change as the same persisting node just getting
            a new `story`/`layoutId` prop, instead of the clean
            unmount-somewhere / mount-elsewhere pair (matching a thumbnail
            unmounting to feed the same layoutId here) that Motion needs to
            actually bridge a position/size FLIP. */}
        <StoryCard key={activeStory.id} story={activeStory} isFeatured />
        <StoryCardText story={activeStory} onCta={activeStory.type === 'now' ? () => onSelect(0) : onNext} />
        {thumbnails.map(({ story, index, slot }) => (
          <StoryCard key={story.id} story={story} slot={slot} onSelect={() => onSelect(index)} />
        ))}
      </div>

      <div className="story-carousel-controls">
        <button
          type="button"
          className="story-carousel-arrow"
          aria-label="Previous moment"
          onClick={onPrev}
          disabled={activeIndex === 0}
        >
          <ArrowIcon direction="prev" />
        </button>

        <div className="story-carousel-pagination" role="group" aria-label="Jump to a moment in this year">
          {stories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              className={`story-carousel-dot${index === activeIndex ? ' is-active' : ''}`}
              aria-label={`Go to ${story.headline}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => onSelect(index)}
            />
          ))}
        </div>

        <button type="button" className="story-carousel-arrow" aria-label="Next moment" onClick={onNext}>
          <ArrowIcon direction="next" />
        </button>
      </div>
    </div>
  );
}

export default StoryCarousel;
