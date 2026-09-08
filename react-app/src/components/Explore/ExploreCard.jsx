import { useState } from 'react';
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

// A plain "+", same construction as InspiredIcon above.
function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M12 5 V19 M5 12 H19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// friendStatus: 'none' | 'requested' (outgoing, pending) | 'incoming'
// (they requested us -- shown same as 'none' here since accepting an
// incoming request happens from a dedicated requests list, not this
// card) | 'friends'.
const FRIEND_BUTTON_LABEL = {
  none: 'Add as Friend',
  requested: 'Requested',
  incoming: 'Add as Friend',
  friends: 'Friend',
};

function ExploreCard({ post, index = 0, onToggleInspired, friendStatus, onToggleFriend, onAddToBucketList }) {
  const meta = post.place;
  const isActive = friendStatus === 'friends' || friendStatus === 'requested';
  // Local-only, resets on reload -- there's no stored link back to which
  // Bucket (if any) a given Achievement was turned into, so this is just
  // enough to stop a double-tap making two copies in the same sitting,
  // not a durable "already added" record.
  const [wasAdded, setWasAdded] = useState(false);

  function handleAddToBucketList() {
    onAddToBucketList(post);
    setWasAdded(true);
  }

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
          <motion.button
            type="button"
            className={`explore-card-friend-button${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={onToggleFriend}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            {FRIEND_BUTTON_LABEL[friendStatus] || FRIEND_BUTTON_LABEL.none}
          </motion.button>
        </div>

        <div className="explore-card-content">
          <h3 className="explore-card-title">{post.title}</h3>
          <div className="explore-card-meta">
            <div className="explore-card-meta-left">
              <span className={`explore-card-mode-badge explore-card-mode-badge--${post.mode}`}>
                {modeLabels[post.mode]}
              </span>
              <span className="explore-card-date">{formatDate(post.completedDate)}</span>
            </div>
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

        {/* Inspired alone dead-ends at a reaction -- this is the one tap
            that actually carries a friend's completed Experience back
            into the viewer's own Bucket List, instead of just being
            seen. */}
        <motion.button
          type="button"
          className={`explore-action-button${wasAdded ? ' is-active' : ''}`}
          onClick={handleAddToBucketList}
          disabled={wasAdded}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          <AddIcon />
          {wasAdded ? 'Added' : 'Add to my Bucket List'}
        </motion.button>
      </div>
    </motion.article>
  );
}

export default ExploreCard;
