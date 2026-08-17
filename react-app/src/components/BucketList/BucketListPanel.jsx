import { useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import CategoryFilters from './CategoryFilters';
import BucketCard from './BucketCard';
import ExpandedBucketCard from './ExpandedBucketCard';
import './BucketList.css';

function BucketListPanel({ buckets, onUpdate, onDelete, onComplete }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const openBuckets = useMemo(() => buckets.filter((bucket) => bucket.status !== 'completed'), [buckets]);

  const filteredBuckets = useMemo(
    () => (activeFilter === 'All' ? openBuckets : openBuckets.filter((bucket) => bucket.category === activeFilter)),
    [openBuckets, activeFilter],
  );

  // Excluded from the grid while expanded so its layoutId can project into
  // ExpandedBucketCard instead of both instances existing at once.
  const gridBuckets = useMemo(
    () => filteredBuckets.filter((bucket) => bucket.id !== expandedId),
    [filteredBuckets, expandedId],
  );

  const expandedBucket = buckets.find((bucket) => bucket.id === expandedId) || null;

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
            gridBuckets.map((bucket) => <BucketCard key={bucket.id} bucket={bucket} onOpen={setExpandedId} />)
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {expandedBucket && (
          <ExpandedBucketCard
            key={expandedBucket.id}
            bucket={expandedBucket}
            onClose={() => setExpandedId(null)}
            onUpdate={onUpdate}
            onDelete={(id) => {
              onDelete(id);
              setExpandedId(null);
            }}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default BucketListPanel;
