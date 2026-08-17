import AchievementCard from './AchievementCard';
import './Achievements.css';

function AchievementsShelf({ buckets, onOpenBucket }) {
  const achievements = buckets.filter((bucket) => bucket.status === 'completed');

  return (
    <section className="app-section">
      <div className="section-heading">
        <span className="section-label">The Archive</span>
        <h2>What you’ve lived</h2>
      </div>

      {achievements.length === 0 ? (
        <div className="achievements-empty">Nothing archived yet — your first achievement will appear here.</div>
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
