import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import CategoryFilters from './CategoryFilters';
import BucketCard from './BucketCard';
import './BucketList.css';

function BucketListPanel({ buckets, onOpenBucket }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const openBuckets = useMemo(() => buckets.filter((bucket) => bucket.status !== 'completed'), [buckets]);

  const filteredBuckets = useMemo(
    () => (activeFilter === 'All' ? openBuckets : openBuckets.filter((bucket) => bucket.category === activeFilter)),
    [openBuckets, activeFilter],
  );

  return (
    <section className="app-section bucket-section">
      <div className="section-heading">
        <span className="section-label">Intentions</span>
        <h2>What’s ahead</h2>
      </div>

      <CategoryFilters activeFilter={activeFilter} onChange={setActiveFilter} />

      <div className="bucket-list">
        <AnimatePresence mode="popLayout">
          {filteredBuckets.length === 0 ? (
            <div className="empty-state" key="empty">
              Your next adventure starts here.
            </div>
          ) : (
            filteredBuckets.map((bucket) => <BucketCard key={bucket.id} bucket={bucket} onOpen={onOpenBucket} />)
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default BucketListPanel;
