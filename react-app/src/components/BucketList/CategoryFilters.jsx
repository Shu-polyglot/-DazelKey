import { motion } from 'motion/react';
import { allowedCategories } from '../../lib/buckets';
import { spring } from '../../styles/motion';

function CategoryFilters({ activeFilter, onChange }) {
  const categories = ['All', ...allowedCategories];

  return (
    <div className="filter-row" aria-label="Filter bucket categories">
      {categories.map((category) => (
        <motion.button
          key={category}
          type="button"
          className={`filter-button${activeFilter === category ? ' is-active' : ''}`}
          onClick={() => onChange(category)}
          whileHover={{ scale: 1.04, transition: spring.hover }}
          whileTap={{ scale: 0.92, transition: spring.press }}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
}

export default CategoryFilters;
