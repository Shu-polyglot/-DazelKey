import { motion } from 'motion/react';
import { getNextUpcoming } from '../lib/buckets';
import { formatDate } from '../lib/dates';
import { transitions } from '../styles/motion';
import './NextUpPanel.css';

function NextUpPanel({ buckets, onOpenBucket }) {
  const next = getNextUpcoming(buckets);

  return (
    <section className="panel next-up-panel">
      <p className="eyebrow">What’s ahead</p>

      {next ? (
        <motion.button
          type="button"
          className="next-up-target"
          onClick={() => onOpenBucket(next.id)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          transition={transitions.micro}
        >
          <h2>{next.title}</h2>
          <p className="next-up-meta">
            {next.category} · {formatDate(next.targetDate)}
          </p>
        </motion.button>
      ) : (
        <div className="next-up-target">
          <h2>Nothing on the horizon yet.</h2>
          <p className="next-up-meta">Give one of your intentions a date to see it here.</p>
        </div>
      )}
    </section>
  );
}

export default NextUpPanel;
