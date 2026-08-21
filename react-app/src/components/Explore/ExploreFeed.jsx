import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ExploreCard from './ExploreCard';
import ModeFilters from './ModeFilters';
import { useExploreFeed } from '../../hooks/useExploreFeed';
import { entranceTransition } from '../../styles/motion';
import './Explore.css';

function ExploreFeed({ onOpenDM }) {
  const { feed, toggleInspired } = useExploreFeed();
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredFeed = useMemo(
    () => (activeFilter === 'All' ? feed : feed.filter((post) => post.mode === activeFilter)),
    [feed, activeFilter],
  );

  return (
    <section className="app-section" id="explore-section">
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(0)}
      >
        <span className="section-label">Discover</span>
        <h2>Explore</h2>
      </motion.div>

      <ModeFilters activeFilter={activeFilter} onChange={setActiveFilter} />

      {filteredFeed.length === 0 ? (
        <div className="explore-empty">Nothing here yet -- try a different filter.</div>
      ) : (
        <div className="explore-feed">
          {filteredFeed.map((post, index) => (
            <ExploreCard key={post.id} post={post} index={index} onToggleInspired={toggleInspired} onOpenDM={onOpenDM} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ExploreFeed;
