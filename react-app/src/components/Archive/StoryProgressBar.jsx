import { motion } from 'motion/react';

// Reflects the currently selected year's own reel -- switching years (see
// YearNav) swaps this out for a fresh, shorter or longer row rather than
// growing one giant bar for the whole archive.
function StoryProgressBar({ stories, activeIndex, progress }) {
  const count = stories.length;
  return (
    <div
      className="story-progress"
      role="progressbar"
      aria-label="Position in this year"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuetext={`Story ${activeIndex + 1} of ${count}`}
    >
      {stories.map((story, index) => (
        <span className="story-progress-segment" key={story.id}>
          {index < activeIndex && <span className="story-progress-fill is-done" />}
          {index === activeIndex && <motion.span className="story-progress-fill" style={{ scaleX: progress }} />}
        </span>
      ))}
    </div>
  );
}

export default StoryProgressBar;
