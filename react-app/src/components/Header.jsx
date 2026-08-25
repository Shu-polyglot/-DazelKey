import { motion } from 'motion/react';
import { dashboardEntrance, entranceTransition } from '../styles/motion';
import dazelkeyLockup from '../assets/logo/dazelkey-lockup-compact.png';
import './Header.css';

// "+ Add to The Bucket List" used to live here, shown on every tab --
// it's now Momentum's own affordance instead (see BucketListPanel's
// `bucket-add-icon`, embedded next to its "The Bucket List" heading
// when StrategyPage passes it an `onAdd`), so this header is just the
// logo again.
function Header({ title }) {
  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(dashboardEntrance.header)}
    >
      <div className="brand-wrap">
        <h1 className="brand-wordmark">
          <img src={dazelkeyLockup} alt={title} className="brand-logo dazelkey-mark-inverted" />
        </h1>
      </div>
    </motion.header>
  );
}

export default Header;
