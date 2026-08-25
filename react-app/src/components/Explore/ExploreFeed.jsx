import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ExploreCard from './ExploreCard';
import ViewFilters from './ViewFilters';
import { useExploreFeed } from '../../hooks/useExploreFeed';
import { useFriends } from '../../hooks/useFriends';
import { entranceTransition } from '../../styles/motion';
import './Explore.css';

function ExploreFeed({ onOpenDM }) {
  const { feed, toggleInspired } = useExploreFeed();
  const { isFriend, toggleFriend } = useFriends();
  const [activeFilter, setActiveFilter] = useState('Everyone');

  const filteredFeed = useMemo(
    () => (activeFilter === 'Everyone' ? feed : feed.filter((post) => isFriend(post.user.handle))),
    [feed, activeFilter, isFriend],
  );

  const isFriendsEmpty = activeFilter === 'Friends' && filteredFeed.length === 0;

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

      <ViewFilters activeFilter={activeFilter} onChange={setActiveFilter} />

      {filteredFeed.length === 0 ? (
        <div className="explore-empty">
          {isFriendsEmpty
            ? "No friends here yet -- add someone from Everyone, and their bucket comes to you."
            : 'Nothing shared yet -- check back soon.'}
        </div>
      ) : (
        <div className="explore-feed">
          {filteredFeed.map((post, index) => (
            <ExploreCard
              key={post.id}
              post={post}
              index={index}
              onToggleInspired={toggleInspired}
              onOpenDM={onOpenDM}
              isFriend={isFriend(post.user.handle)}
              onToggleFriend={toggleFriend}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ExploreFeed;
