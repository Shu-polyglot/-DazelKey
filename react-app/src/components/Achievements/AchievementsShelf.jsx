import { motion } from 'motion/react';
import AchievementCard from './AchievementCard';
import { dashboardEntrance, entranceTransition } from '../../styles/motion';
import './Achievements.css';

function AchievementsShelf({ buckets, onOpenBucket }) {
  const achievements = buckets.filter((bucket) => bucket.status === 'completed');

  return (
    <section className="app-section">
      <motion.div
        className="section-heading"
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={entranceTransition(dashboardEntrance.achievements)}
      >
        <span className="section-label">The Archive</span>
        <h2>What you’ve lived</h2>
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
          {achievements.map((bucket, index) => (
            <AchievementCard key={bucket.id} bucket={bucket} index={index} onOpen={onOpenBucket} />
          ))}
        </div>
      )}
    </section>
  );
}

export default AchievementsShelf;
