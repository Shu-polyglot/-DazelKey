import { motion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { transitions, spring } from '../../styles/motion';
import './Achievements.css';

function AchievementCard({ bucket, index, onOpen }) {
  return (
    <motion.article
      className="achievement-card"
      onClick={() => onOpen(bucket.id)}
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...transitions.emphasis, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6, scale: 1.015, transition: spring.hover }}
      whileTap={{ y: -1, scale: 0.97, transition: spring.press }}
    >
      <div className="achievement-card-frame">
        <div className="achievement-card-top">
          <span className="achievement-card-eyebrow">{bucket.category}</span>
          <span className="achievement-card-index">No. {String(index + 1).padStart(2, '0')}</span>
        </div>

        <h3 className="achievement-card-title">{bucket.title}</h3>

        <div className="achievement-card-bottom">
          <div className="achievement-card-rule" />
          <div className="achievement-card-meta">
            <span className="achievement-card-date">{formatDate(bucket.completedDate)}</span>
            {bucket.location && <span className="achievement-card-location">{bucket.location}</span>}
          </div>
          {bucket.memory && <p className="achievement-card-memory">“{bucket.memory}”</p>}
        </div>
      </div>
    </motion.article>
  );
}

export default AchievementCard;
