import { motion } from 'motion/react';
import { getStatusLabel } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';

function BucketCard({ bucket, onOpen }) {
  const meta =
    bucket.status === 'completed'
      ? bucket.completedDate
        ? formatDate(bucket.completedDate)
        : 'Completed'
      : bucket.dateType === 'someday'
        ? 'Someday'
        : bucket.targetDate
          ? formatDate(bucket.targetDate)
          : 'Date to be chosen';

  return (
    <motion.article
      className="bucket-card"
      data-status={getStatusLabel(bucket)}
      onClick={() => onOpen(bucket.id)}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      whileHover={{ y: -3, transition: spring.hover }}
      whileTap={{ y: 0, scale: 0.98, transition: spring.press }}
      transition={{ layout: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }, default: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div className="bucket-card-top">
        <p className="bucket-category">{bucket.category}</p>
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
