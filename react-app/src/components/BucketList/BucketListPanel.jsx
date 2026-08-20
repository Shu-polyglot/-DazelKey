import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import ModeFilters from './ModeFilters';
import BucketCard from './BucketCard';
import ExpandedBucketCard from './ExpandedBucketCard';
import { dashboardEntrance, entranceTransition } from '../../styles/motion';
import './BucketList.css';

function BucketListPanel({
  buckets,
  onUpdate,
  onDelete,
  onComplete,
  sectionId = 'bucket-list-section',
  layoutIdPrefix = 'bucket-card-',
  baseDelay = dashboardEntrance.bucketList,
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const openBuckets = useMemo(() => buckets.filter((bucket) => bucket.status !== 'completed'), [buckets]);

  const filteredBuckets = useMemo(
    () => (activeFilter === 'All' ? openBuckets : openBuckets.filter((bucket) => bucket.mode === activeFilter)),
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
    <section className="app-section bucket-section" id={sectionId}>
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(baseDelay)}
      >
        <div className="section-heading">
          <span className="section-label">Intentions</span>
          <h2>The Bucket List</h2>
        </div>

        <ModeFilters activeFilter={activeFilter} onChange={setActiveFilter} />
      </motion.div>

      <div className="bucket-list">
        <AnimatePresence mode="popLayout">
          {filteredBuckets.length === 0 ? (
            <motion.div
              className="empty-state"
              key="empty"
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={entranceTransition(baseDelay + 0.06)}
            >
              Your next adventure starts here.
            </motion.div>
          ) : (
            gridBuckets.map((bucket, index) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                index={index}
                onOpen={setExpandedId}
                layoutId={`${layoutIdPrefix}${bucket.id}`}
                baseDelay={baseDelay}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Portaled to escape page-shell's filter-trap (see App.jsx) so this
          stays truly viewport-fixed instead of centering within
          page-shell's full content height. */}
      {createPortal(
        <AnimatePresence>
          {expandedBucket && (
            <ExpandedBucketCard
              key={expandedBucket.id}
              bucket={expandedBucket}
              layoutId={`${layoutIdPrefix}${expandedBucket.id}`}
              onClose={() => setExpandedId(null)}
              onUpdate={onUpdate}
              onDelete={(id) => {
                onDelete(id);
                setExpandedId(null);
              }}
              onComplete={onComplete}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

export default BucketListPanel;
