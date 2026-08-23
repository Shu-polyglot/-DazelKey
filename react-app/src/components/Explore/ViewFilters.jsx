import { motion } from 'motion/react';
import { spring } from '../../styles/motion';

const filters = ['Friends', 'Everyone'];

// Formerly Solo/Together -- that distinction now lives on each card as a
// badge (see ExploreCard's mode badge) instead of gating the feed itself.
// These tabs answer "whose posts do I see" rather than "was the
// experience solo or together". Same chip look/behavior as before, just
// re-pointed at the friends-vs-everyone axis.
function ViewFilters({ activeFilter, onChange }) {
  return (
    <div className="explore-filter-row" aria-label="Filter by whose posts to show">
      {filters.map((filter) => (
        <motion.button
          key={filter}
          type="button"
          className={`explore-filter-button${activeFilter === filter ? ' is-active' : ''}`}
          onClick={() => onChange(filter)}
          whileHover={{ scale: 1.04, transition: spring.hover }}
          whileTap={{ scale: 0.92, transition: spring.press }}
        >
          {filter}
        </motion.button>
      ))}
    </div>
  );
}

export default ViewFilters;
