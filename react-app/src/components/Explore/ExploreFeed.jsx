import { useMemo } from 'react';
import { motion } from 'motion/react';
import ExploreCard from './ExploreCard';
import { useExploreFeed } from '../../hooks/useExploreFeed';
import { useFriends } from '../../hooks/useFriends';
import { entranceTransition } from '../../styles/motion';
import './Explore.css';

// Friends-only now -- the Everyone tab (and the ViewFilters chip switch
// that toggled between them) is gone, so this always filters `feed` down
// to people the user has an accepted friendship with (see useFriends'
// statusWith). Matches on post.user.id (a real auth user id), not a
// display handle -- see useFriends.js for why.
function ExploreFeed({ onOpenDM }) {
  const { feed, toggleInspired } = useExploreFeed();
  const { statusWith, sendRequest, removeFriendship, friendships } = useFriends();

  const filteredFeed = useMemo(
    () => feed.filter((post) => statusWith(post.user.id) === 'friends'),
    [feed, statusWith],
  );

  function handleToggleFriend(userId) {
    const status = statusWith(userId);
    if (status === 'none') {
      sendRequest(userId);
      return;
    }
    // 'friends' or 'requested' (a pending outgoing request) -- either way,
    // tapping the button again withdraws it. Find the row to remove.
    const row = friendships.find((f) => f.requester_id === userId || f.addressee_id === userId);
    if (row) {
      removeFriendship(row.id);
    }
  }

  return (
    <section className="app-section" id="explore-section">
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(0)}
      >
        <span className="section-label">Discover</span>
      </motion.div>

      {filteredFeed.length === 0 ? (
        <div className="explore-empty">No friends here yet -- add someone, and their bucket comes to you.</div>
      ) : (
        <div className="explore-feed">
          {filteredFeed.map((post, index) => (
            <ExploreCard
              key={post.id}
              post={post}
              index={index}
              onToggleInspired={toggleInspired}
              onOpenDM={onOpenDM}
              friendStatus={statusWith(post.user.id)}
              onToggleFriend={() => handleToggleFriend(post.user.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ExploreFeed;
