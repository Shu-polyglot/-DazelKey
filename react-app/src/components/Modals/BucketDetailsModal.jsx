import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './Modal';
import ShareModal from '../Achievements/ShareModal';
import CompletePrompt from '../shared/CompletePrompt';
import CompletedPhotoHero from '../shared/CompletedPhotoHero';
import { getStatusLabel, getWhenLabel, modeLabels } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

function DetailsView({ bucket, onClose, onShare, onComplete }) {
  const hasPhotoHero = bucket.status === 'completed' && Boolean(bucket.image);

  const entries = [
    ['Mode', modeLabels[bucket.mode]],
    ['Status', getStatusLabel(bucket)],
  ];

  if (bucket.status === 'completed') {
    if (bucket.completedDate) {
      entries.push(['Completed date', formatDate(bucket.completedDate)]);
    }
  } else {
    entries.push(['When', getWhenLabel(bucket.when)]);
  }

  if (bucket.place) {
    entries.push(['Place', bucket.place]);
  }

  return (
    <>
      {hasPhotoHero ? (
        <CompletedPhotoHero bucket={bucket} />
      ) : (
        <>
          {bucket.status === 'completed' && <p className="archived-tag">In the Archive</p>}
          <h3>{bucket.title}</h3>
        </>
      )}

      <div className="detail-section">
        <div className="detail-meta">
          {entries.map(([label, value]) => (
            <div className="detail-item" key={label}>
              <span className="label">{label}</span>
              <span className="value">{value}</span>
            </div>
          ))}
        </div>

        {bucket.message && (
          <div className="detail-item">
            <span className="label">Message</span>
            <span className="value">{bucket.message}</span>
          </div>
        )}
      </div>

      {bucket.status !== 'completed' && <CompletePrompt bucketId={bucket.id} onComplete={onComplete} />}

      <div className="detail-actions">
        <motion.button type="button" className="secondary-button" onClick={onShare} {...tapProps}>
          ↗ Share
        </motion.button>
        <motion.button type="button" className="secondary-button" onClick={onClose} {...tapProps}>
          Close
        </motion.button>
      </div>
    </>
  );
}

function BucketDetailsModal({ bucket, onClose, onComplete }) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <Modal onClose={onClose} className="detail-modal">
        <div className="modal-header detail-header">
          <h3>Bucket details</h3>
          <motion.button
            type="button"
            className="icon-button"
            aria-label="Close details"
            onClick={onClose}
            whileHover={{ rotate: 90, transition: spring.hover }}
            whileTap={{ scale: 0.88, transition: spring.press }}
          >
            ×
          </motion.button>
        </div>

        <div className="detail-content">
          <DetailsView bucket={bucket} onClose={onClose} onShare={() => setIsShareOpen(true)} onComplete={onComplete} />
        </div>
      </Modal>

      <AnimatePresence>
        {isShareOpen && <ShareModal key="share-modal" bucket={bucket} onClose={() => setIsShareOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default BucketDetailsModal;
