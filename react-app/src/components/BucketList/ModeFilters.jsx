import { motion } from 'motion/react';
import { modeOptions, modeLabels } from '../../lib/buckets';
import { spring } from '../../styles/motion';

const filters = ['All', ...modeOptions];

function ModeFilters({ activeFilter, onChange }) {
  return (
    <div className="filter-row" aria-label="Filter by who you're doing this with">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          type="button"
          className={`filter-button${activeFilter === filter ? ' is-active' : ''}`}
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
