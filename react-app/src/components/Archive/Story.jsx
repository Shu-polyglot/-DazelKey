import { motion, useReducedMotion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { archiveMediaVariants, archiveContentVariants, spring } from '../../styles/motion';

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

function StoryMedia({ story, prefersReducedMotion }) {
  const mediaStyle =
    story.media?.kind === 'photo' ? { backgroundImage: `url(${story.media.src})` } : gradientStyle(story);
  const kenBurnsSeconds = story.duration === Infinity ? 20 : story.duration / 1000;

  return (
    <motion.div className="story-media" variants={archiveMediaVariants}>
      <motion.div
        className="story-media-surface"
        style={mediaStyle}
        initial={{ scale: 1 }}
        animate={{ scale: prefersReducedMotion ? 1 : 1.05 }}
        transition={{ duration: kenBurnsSeconds, ease: 'linear' }}
      />
      <div className="story-scrim" />
    </motion.div>
  );
}

function StoryContent({ story }) {
  const isNow = story.type === 'now';
  const hasMeta = !isNow && (story.place || story.date);

  return (
    <motion.div className={`story-content${isNow ? ' is-now' : ''}`} variants={archiveContentVariants}>
      <span className="story-eyebrow">{isNow ? 'Right now' : eyebrowFor(story)}</span>
      <h2 className="story-headline">{story.headline}</h2>
      {story.caption && (
        <p className="story-caption">{isNow ? story.caption : `“${story.caption}”`}</p>
      )}
      {hasMeta && (
        <div className="story-meta">
          {story.place && <span>{story.place}</span>}
          {story.date && <span>{formatDate(story.date)}</span>}
        </div>
      )}
    </motion.div>
  );
}

function Story({ story, onReturnToStart }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="story">
      <StoryMedia story={story} prefersReducedMotion={prefersReducedMotion} />
      <StoryContent story={story} />
      {story.type === 'now' && (
        <motion.button
          type="button"
          className="story-bridge-cta"
          variants={archiveContentVariants}
          onClick={onReturnToStart}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          Return
        </motion.button>
      )}
    </div>
  );
}

export default Story;
