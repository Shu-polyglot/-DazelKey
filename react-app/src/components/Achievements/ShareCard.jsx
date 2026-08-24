import { forwardRef } from 'react';
import { formatDate } from '../../lib/dates';
import { modeLabels } from '../../lib/buckets';
import './ShareCard.css';

/*
  Rendered at its natural on-screen CSS size (a responsive 9:16 box, not a
  fixed 1080x1920 canvas) so the preview the user sees in ShareModal *is*
  the exact node ShareModal rasterizes with html-to-image — no separate
  "hidden full-res clone" to keep visually in sync. Export resolution is
  handled by html-to-image's pixelRatio option at capture time instead.
*/
const ShareCard = forwardRef(function ShareCard({ bucket }, ref) {
  const hasPhoto = Boolean(bucket.image);

  return (
    <div ref={ref} className={`share-card${hasPhoto ? '' : ' is-gradient'}`}>
      {hasPhoto && <img src={bucket.image} alt="" className="share-card-photo" crossOrigin="anonymous" />}
      <div className="share-card-scrim" />

      <div className="share-card-content">
        <span className="share-card-eyebrow">{modeLabels[bucket.mode]}</span>

        <div className="share-card-body">
          <h2 className="share-card-title">{bucket.title}</h2>
          <div className="share-card-meta">
            {bucket.completedDate && <span>{formatDate(bucket.completedDate)}</span>}
            {bucket.place && <span>{bucket.place}</span>}
          </div>
        </div>

        <div className="share-card-brand">
          <span className="share-card-brand-mark" />
          <span>DazelKey</span>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
