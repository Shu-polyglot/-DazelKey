import { motion } from 'motion/react';

function StoryProgressBar({ count, activeIndex, progress }) {
  return (
    <div
      className="story-progress"
      role="progressbar"
      aria-label="Position in your archive"
      aria-valuenow={activeIndex + 1}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuetext={`Story ${activeIndex + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <span className="story-progress-segment" key={index}>
          {index < activeIndex && <span className="story-progress-fill is-done" />}
          {index === activeIndex && <motion.span className="story-progress-fill" style={{ scaleX: progress }} />}
        </span>
      ))}
    </div>
  );
}

export default StoryProgressBar;
