import { motion } from 'motion/react';
import { getStatusLabel, getWhenLabel, sortPlanItems, formatPlanTime } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring, easing, dashboardEntrance, staggerDelay } from '../../styles/motion';

function BucketCard({ bucket, index = 0, onOpen, layoutId, baseDelay = dashboardEntrance.bucketList }) {
  const resolvedLayoutId = layoutId || `bucket-card-${bucket.id}`;

  const meta =
    bucket.status === 'completed' ? (bucket.completedDate ? formatDate(bucket.completedDate) : 'Completed') : null;

  return (
    <motion.article
      className="bucket-card"
      data-status={getStatusLabel(bucket)}
      onClick={() => onOpen(bucket.id)}
      layoutId={resolvedLayoutId}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      whileHover={{ y: -3, transition: spring.hover }}
      whileTap={{ y: 0, scale: 0.98, transition: spring.press }}
      transition={{
        layout: { duration: 0.6, ease: easing.emphasized },
        default: { duration: 0.5, delay: staggerDelay(baseDelay, index), ease: easing.emphasized },
      }}
    >
      <div className="bucket-card-top">
        <p className="bucket-category">{bucket.status === 'completed' ? 'Completed' : getWhenLabel(bucket.when)}</p>
        <span className="bucket-status">{getStatusLabel(bucket)}</span>
      </div>

      <h3>{bucket.title}</h3>
      {meta && <div className="bucket-meta">{meta}</div>}

      {bucket.planItems?.length > 0 && (
        <ul className="bucket-card-itinerary-list">
          {sortPlanItems(bucket.planItems).map((item) => (
            <li className="bucket-card-itinerary-row" key={item.id}>
              <span className="bucket-card-itinerary-time">{formatPlanTime(item.time)}</span>
              <span className="bucket-card-itinerary-text">{item.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="bucket-card-actions">
        <motion.button
          type="button"
          className="bucket-status-button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(bucket.id);
          }}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.94, transition: spring.press }}
        >
          {bucket.status === 'completed' ? 'View memory' : 'Open'}
        </motion.button>
      </div>
    </motion.article>
  );
}

export default BucketCard;
