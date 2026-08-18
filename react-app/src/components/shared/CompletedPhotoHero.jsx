import { formatDate } from '../../lib/dates';

/*
  Shared by ExpandedBucketCard and BucketDetailsModal so a completed Bucket
  reads the same wherever it's opened from -- the Archive shelf or a
  Calendar day. Renders nothing when there's no photo, leaving the
  existing text-only completed view untouched.
*/
function CompletedPhotoHero({ bucket }) {
  if (!bucket.image) {
    return null;
  }

  return (
    <div className="completed-photo-hero">
      <img src={bucket.image} alt="" className="completed-photo-hero-image" />
      <div className="completed-photo-hero-scrim" />
      <div className="completed-photo-hero-content">
        <span className="completed-photo-hero-eyebrow">In the Archive</span>
        <h2 className="completed-photo-hero-title">{bucket.title}</h2>
        {bucket.completedDate && <p className="completed-photo-hero-date">{formatDate(bucket.completedDate)}</p>}
      </div>
    </div>
  );
}

export default CompletedPhotoHero;
