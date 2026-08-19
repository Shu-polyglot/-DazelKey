import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import AchievementCard from './AchievementCard';
import AchievementExpanded from './AchievementExpanded';
import './Achievements.css';

const LAYOUT_ID_PREFIX = 'profile-gallery-card-';

/*
  Profile's "Achievement Gallery" -- the same completed Buckets, the same
  AchievementCard and AchievementExpanded (view/edit/delete/share) as The
  Achievement tab's shelf, just browsed as a square grid instead of a
  horizontal strip. Its own expandedId and its own layoutId namespace
  (see AchievementCard) keep it independent from AchievementsShelf, which
  stays mounted on the other tab (display:none, not unmounted) at the
  same time.
*/
function AchievementGallery({ buckets, onUpdate, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  const achievements = useMemo(
    () => buckets.filter((bucket) => bucket.status === 'completed'),
    [buckets],
  );

  const indexedAchievements = useMemo(
    () => achievements.map((bucket, index) => ({ bucket, index })),
    [achievements],
  );

  const galleryAchievements = useMemo(
    () => indexedAchievements.filter(({ bucket }) => bucket.id !== expandedId),
    [indexedAchievements, expandedId],
  );

  const expanded = indexedAchievements.find(({ bucket }) => bucket.id === expandedId) || null;

  return (
    <section className="app-section">
      <div className="section-heading">
        <span className="section-label">Achievement Gallery</span>
      </div>

      {achievements.length === 0 ? (
        <div className="achievements-empty">
          Nothing archived yet — your completed experiences will appear here.
        </div>
      ) : (
        <div className="achievement-gallery-grid">
          {galleryAchievements.map(({ bucket, index }) => (
            <AchievementCard
              key={bucket.id}
              bucket={bucket}
              index={index}
              onOpen={setExpandedId}
              variant="gallery"
              layoutId={`${LAYOUT_ID_PREFIX}${bucket.id}`}
            />
          ))}
        </div>
      )}

      {/* Portaled for the same reason AchievementsShelf portals its own
          AchievementExpanded -- see App.jsx's page-shell filter-trap note. */}
      {createPortal(
        <AnimatePresence>
          {expanded && (
            <AchievementExpanded
              key={expanded.bucket.id}
              bucket={expanded.bucket}
              index={expanded.index}
              layoutId={`${LAYOUT_ID_PREFIX}${expanded.bucket.id}`}
              onClose={() => setExpandedId(null)}
              onUpdate={onUpdate}
              onDelete={(id) => {
                onDelete(id);
                setExpandedId(null);
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

export default AchievementGallery;
