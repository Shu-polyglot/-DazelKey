import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CinematicBackground from '../Onboarding/CinematicBackground';
import BucketCard from '../BucketList/BucketCard';
import BucketDetailsModal from '../Modals/BucketDetailsModal';
import { whenOptions } from '../../lib/buckets';
import { easing } from '../../styles/motion';
import '../BucketList/BucketList.css';
import './Archive.css';
import './WhatsAhead.css';

/*
  The counterpart to the Life Archive: same cinematic backdrop and
  typographic voice (reuses Archive.css's own bridge classes rather than
  redeclaring them), but reading forward instead of back. Bucket Details
  is opened with its own local state here -- not App.jsx's -- because this
  view is a fixed-position sibling of .page-shell, not a descendant of it;
  routing through App's detailsBucketId would nest the modal under
  page-shell's Motion-animated filter, which silently traps position:fixed
  descendants inside page-shell's stacking context and hides them behind
  this view. Keeping it local sidesteps that entirely.
*/
function WhatsAheadExperience({ buckets, onClose, onComplete }) {
  const [detailsBucketId, setDetailsBucketId] = useState(null);

  const upcoming = useMemo(
    () =>
      buckets
        .filter((bucket) => bucket.status !== 'completed')
        .slice()
        .sort((a, b) => whenOptions.indexOf(a.when) - whenOptions.indexOf(b.when)),
    [buckets],
  );

  const detailsBucket = upcoming.find((bucket) => bucket.id === detailsBucketId) || null;

  return (
    <motion.div
      className="whats-ahead-experience"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.15, ease: easing.emphasized } }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(16px)', transition: { duration: 0.5, ease: easing.exit } }}
    >
      <CinematicBackground />

      <button type="button" className="archive-close" aria-label="Back to Life OS" onClick={onClose}>
        ×
      </button>

      <div className="whats-ahead-scroll">
        <motion.div
          className="whats-ahead-header"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6, delay: 0.35, ease: easing.emphasized },
          }}
        >
          <span className="archive-bridge-eyebrow">The Bucket List</span>
          <h1 className="whats-ahead-headline">The story isn&rsquo;t finished.</h1>
          <p className="archive-bridge-copy">
            {upcoming.length > 0
              ? `${upcoming.length} intention${upcoming.length === 1 ? '' : 's'} still waiting for you.`
              : 'Nothing waiting yet — add an intention to see it here.'}
          </p>
        </motion.div>

        {upcoming.length > 0 ? (
          <motion.div
            className="bucket-list whats-ahead-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.5, ease: easing.emphasized } }}
          >
            {upcoming.map((bucket, index) => (
              <BucketCard key={bucket.id} bucket={bucket} index={index} onOpen={setDetailsBucketId} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="whats-ahead-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.5, ease: easing.emphasized } }}
          >
            Nothing on the horizon yet.
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {detailsBucket && (
          <BucketDetailsModal
            key={detailsBucket.id}
            bucket={detailsBucket}
            onClose={() => setDetailsBucketId(null)}
            onComplete={onComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default WhatsAheadExperience;
