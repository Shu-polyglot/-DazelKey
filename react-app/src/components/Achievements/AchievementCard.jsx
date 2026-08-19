import { motion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { modeLabels } from '../../lib/buckets';
import { spring, dashboardEntrance, entranceTransition, staggerDelay } from '../../styles/motion';
import './Achievements.css';

// `variant="gallery"` is Profile's compact square grid thumbnail -- same
// component, same data, just the meta/memory footer dropped for space and
// a distinct `layoutId` (see AchievementGallery) so it doesn't collide
// with AchievementsShelf's identically-keyed cards, which stay mounted
// (display:none, not unmounted) on the other tab at the same time.
function AchievementCard({ bucket, index, onOpen, variant = 'shelf', layoutId }) {
  const hasPhoto = Boolean(bucket.image);
  const resolvedLayoutId = layoutId || `achievement-card-${bucket.id}`;

  return (
    <motion.article
      className={`achievement-card${hasPhoto ? ' has-photo' : ''}${variant === 'gallery' ? ' achievement-card--gallery' : ''}`}
      onClick={() => onOpen(bucket.id)}
      layoutId={resolvedLayoutId}
      layout
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{
        layout: spring.soft,
        default: entranceTransition(staggerDelay(dashboardEntrance.achievements, index)),
      }}
      whileHover={{ y: -6, scale: 1.015, transition: spring.hover }}
      whileTap={{ y: -1, scale: 0.97, transition: spring.press }}
    >
      <div className="achievement-card-frame">
        {hasPhoto && <div className="achievement-card-photo" style={{ backgroundImage: `url(${bucket.image})` }} />}
        {hasPhoto && <div className="achievement-card-scrim" />}
        <div className="achievement-card-top">
          <span className="achievement-card-eyebrow">{modeLabels[bucket.mode]}</span>
          <span className="achievement-card-index">No. {String(index + 1).padStart(2, '0')}</span>
        </div>

        <h3 className="achievement-card-title">{bucket.title}</h3>

        {variant !== 'gallery' && (
          <div className="achievement-card-bottom">
            <div className="achievement-card-rule" />
            <div className="achievement-card-meta">
              <span className="achievement-card-date">{formatDate(bucket.completedDate)}</span>
              {bucket.place && <span className="achievement-card-location">{bucket.place}</span>}
            </div>
            {bucket.message && <p className="achievement-card-memory">“{bucket.message}”</p>}
          </div>
        )}
      </div>
    </motion.article>
  );
}

export default AchievementCard;
