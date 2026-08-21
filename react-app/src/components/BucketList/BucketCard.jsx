import { motion } from 'motion/react';
import { getStatusLabel, getWhenLabel, modeLabels } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring, easing, dashboardEntrance, staggerDelay } from '../../styles/motion';

function BucketCard({ bucket, index = 0, onOpen, layoutId, baseDelay = dashboardEntrance.bucketList }) {
  const resolvedLayoutId = layoutId || `bucket-card-${bucket.id}`;

  const meta =
    bucket.status === 'completed'
      ? bucket.completedDate
        ? formatDate(bucket.completedDate)
        : 'Completed'
      : [modeLabels[bucket.mode], bucket.place].filter(Boolean).join(' · ');

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
      <div className="bucket-meta">{meta}</div>

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
