import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AchievementCard from './AchievementCard';
import AchievementExpanded from './AchievementExpanded';
import { dashboardEntrance, entranceTransition } from '../../styles/motion';
import './Achievements.css';

function AchievementsShelf({ buckets, onUpdate, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  const achievements = useMemo(
    () => buckets.filter((bucket) => bucket.status === 'completed'),
    [buckets],
  );

  // Index carries the shelf's original position (No. 01, 02...) so the
  // label doesn't reflow while the expanded card is excluded below.
  const indexedAchievements = useMemo(
    () => achievements.map((bucket, index) => ({ bucket, index })),
    [achievements],
  );

  // Excluded from the shelf while expanded so its layoutId can project
  // into AchievementExpanded instead of both instances existing at once.
  const shelfAchievements = useMemo(
    () => indexedAchievements.filter(({ bucket }) => bucket.id !== expandedId),
    [indexedAchievements, expandedId],
  );

  const expanded = indexedAchievements.find(({ bucket }) => bucket.id === expandedId) || null;

  return (
    <section className="app-section">
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(dashboardEntrance.achievements)}
      >
        <span className="section-label">The Archive</span>
      </motion.div>

      {achievements.length === 0 ? (
        <motion.div
          className="achievements-empty"
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={entranceTransition(dashboardEntrance.achievements + 0.06)}
        >
          Nothing archived yet — your first achievement will appear here.
        </motion.div>
      ) : (
        <div className="achievements-shelf">
          <AnimatePresence mode="popLayout">
            {shelfAchievements.map(({ bucket, index }) => (
              <AchievementCard key={bucket.id} bucket={bucket} index={index} onOpen={setExpandedId} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <AchievementExpanded
            key={expanded.bucket.id}
            bucket={expanded.bucket}
            index={expanded.index}
            onClose={() => setExpandedId(null)}
            onUpdate={onUpdate}
            onDelete={(id) => {
              onDelete(id);
              setExpandedId(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default AchievementsShelf;
