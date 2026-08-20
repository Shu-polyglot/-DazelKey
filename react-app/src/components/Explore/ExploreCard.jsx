import { motion } from 'motion/react';
import { formatDate } from '../../lib/dates';
import { modeLabels } from '../../lib/buckets';
import { spring } from '../../styles/motion';

// Small line-glyphs in the app's own thin-stroke style (see BottomNav's
// icon set) -- Inspired swaps outline-to-solid on toggle the same way the
// nav's own icons read "selected".
function InspiredIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M12 4 L14.1 9.5 L20 10.2 L15.6 14.1 L16.9 20 L12 16.9 L7.1 20 L8.4 14.1 L4 10.2 L9.9 9.5 Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M4 6.5 C4 5.4 4.9 4.5 6 4.5 H18 C19.1 4.5 20 5.4 20 6.5 V14.5 C20 15.6 19.1 16.5 18 16.5 H9.5 L5.5 19.7 V16.5 H6 C4.9 16.5 4 15.6 4 14.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreCard({ post, index = 0, onToggleInspired, onOpenDM }) {
  const meta = [modeLabels[post.mode], post.place].filter(Boolean).join(' · ');

  return (
    <motion.article
      className="explore-card"
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="explore-card-frame">
        <div className="explore-card-photo" style={{ backgroundImage: `url(${post.image})` }} />
        <div className="explore-card-scrim" />

        <div className="explore-card-user">
          <span className="explore-card-avatar" style={{ backgroundImage: `url(${post.user.avatar})` }} />
          <div className="explore-card-user-meta">
            <span className="explore-card-username">{post.user.name}</span>
            <span className="explore-card-handle">{post.user.handle}</span>
          </div>
        </div>

        <div className="explore-card-content">
          <h3 className="explore-card-title">{post.title}</h3>
          <div className="explore-card-meta">
            <span className="explore-card-date">{formatDate(post.completedDate)}</span>
            {meta && <span className="explore-card-location">{meta}</span>}
          </div>
        </div>
      </div>

      <div className="explore-card-actions">
        <motion.button
          type="button"
          className={`explore-action-button${post.isInspired ? ' is-active' : ''}`}
          aria-pressed={post.isInspired}
          onClick={() => onToggleInspired(post.id)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          <InspiredIcon active={post.isInspired} />
          Inspired · {post.inspiredCount}
        </motion.button>

        <motion.button
          type="button"
          className="explore-action-button"
          onClick={() => onOpenDM(post.user)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          <MessageIcon />
          Message
        </motion.button>
      </div>
    </motion.article>
  );
}

export default ExploreCard;
