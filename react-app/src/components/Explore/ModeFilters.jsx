import { motion } from 'motion/react';
import { modeOptions, modeLabels } from '../../lib/buckets';
import { spring } from '../../styles/motion';

const filters = ['All', ...modeOptions];

// Moved here from The Bucket List, whose own filter tabs switched to a
// when-based horizon (see BucketList/WhenFilters) -- Solo/Together reads
// better against other people's posts than against your own planning
// list. Same chip look/behavior as that original tab row, just its own
// copy (see WhenFilters' header comment for why: feature CSS here stays
// self-contained rather than importing across folders).
function ModeFilters({ activeFilter, onChange }) {
  return (
    <div className="explore-filter-row" aria-label="Filter by who was there">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          type="button"
          className={`explore-filter-button${activeFilter === filter ? ' is-active' : ''}`}
          onClick={() => onChange(filter)}
          whileHover={{ scale: 1.04, transition: spring.hover }}
          whileTap={{ scale: 0.92, transition: spring.press }}
        >
          {filter === 'All' ? 'All' : modeLabels[filter]}
        </motion.button>
      ))}
    </div>
  );
}

export default ModeFilters;
