import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import WhenFilters from './WhenFilters';
import BucketCard from './BucketCard';
import ExpandedBucketCard from './ExpandedBucketCard';
import { dashboardEntrance, entranceTransition, spring } from '../../styles/motion';
import './BucketList.css';

// `variant`: 'page' (default) renders The Bucket List's own full page
// heading (eyebrow + h2) inside an app-section -- for ProfilePage,
// PreviewProfile, and any other standalone use. 'embedded' renders the
// lighter h3 sub-heading Momentum's Core/Realize views use instead, with
// no outer app-section chrome, for dropping into Momentum's own toggle
// (see StrategyPage) after the Core/Bucket Lists swap.
function BucketListPanel({
  buckets,
  onUpdate,
  onDelete,
  onComplete,
  onAdd,
  sectionId = 'bucket-list-section',
  layoutIdPrefix = 'bucket-card-',
  baseDelay = dashboardEntrance.bucketList,
  readOnly = false,
  variant = 'page',
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // Become Buckets (traits) live entirely on Strategy -- this list is
  // Have-only, the same split Strategy's own filter makes in reverse.
  const openBuckets = useMemo(
    () => buckets.filter((bucket) => bucket.status !== 'completed' && bucket.goalType !== 'become'),
    [buckets],
  );

  const filteredBuckets = useMemo(
    () => (activeFilter === 'All' ? openBuckets : openBuckets.filter((bucket) => bucket.when === activeFilter)),
    [openBuckets, activeFilter],
  );

  // Excluded from the grid while expanded so its layoutId can project into
  // ExpandedBucketCard instead of both instances existing at once.
  const gridBuckets = useMemo(
    () => filteredBuckets.filter((bucket) => bucket.id !== expandedId),
    [filteredBuckets, expandedId],
  );

  const expandedBucket = buckets.find((bucket) => bucket.id === expandedId) || null;
  const Wrapper = variant === 'embedded' ? 'div' : 'section';
  const wrapperClassName = variant === 'embedded' ? 'strategy-subsection' : 'app-section bucket-section';

  return (
    <Wrapper className={wrapperClassName} id={sectionId}>
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(baseDelay)}
      >
        {variant === 'embedded' ? (
          <div className="section-heading-row bucket-heading-row">
            <h3>The Bucket List</h3>
            {onAdd && (
              <motion.button
                type="button"
                className="bucket-add-icon"
                aria-label="Add to The Bucket List"
                onClick={onAdd}
                whileHover={{ y: -1, transition: spring.hover }}
                whileTap={{ y: 1, scale: 0.94, transition: spring.press }}
              >
                +
              </motion.button>
            )}
          </div>
        ) : (
          <div className="section-heading">
            <span className="section-label">Intentions</span>
            <h2>The Bucket List</h2>
          </div>
        )}

        <WhenFilters activeFilter={activeFilter} onChange={setActiveFilter} />
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
              onDelete={
                readOnly
                  ? undefined
                  : (id) => {
                      onDelete(id);
                      setExpandedId(null);
                    }
              }
              onComplete={onComplete}
              readOnly={readOnly}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Wrapper>
  );
}

export default BucketListPanel;
