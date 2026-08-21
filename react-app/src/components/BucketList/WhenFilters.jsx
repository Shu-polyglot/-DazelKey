import { motion } from 'motion/react';
import { whenOptions, whenLabels } from '../../lib/buckets';
import { spring } from '../../styles/motion';

const filters = ['All', ...whenOptions];

// The Bucket List's own filter axis: when you want it to happen, not who
// it's with (that moved to Explore -- see Explore/ModeFilters). Reuses
// `when`, the horizon already set per-item at creation, so there's no new
// field to maintain here -- same chip markup/behavior the old Solo/
// Together tabs used, just driven by a different options list.
function WhenFilters({ activeFilter, onChange }) {
  return (
    <div className="filter-row" aria-label="Filter by when you want to make it happen">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          type="button"
          className={`filter-button${activeFilter === filter ? ' is-active' : ''}`}
          onClick={() => onChange(filter)}
          whileHover={{ scale: 1.04, transition: spring.hover }}
          whileTap={{ scale: 0.92, transition: spring.press }}
        >
          {filter === 'All' ? 'All' : whenLabels[filter]}
        </motion.button>
      ))}
    </div>
  );
}

export default WhenFilters;
