import { motion } from 'motion/react';
import { spring, dashboardEntrance, entranceTransition } from '../styles/motion';
import { getInitials } from '../lib/profile';
import dazelkeyLockup from '../assets/logo/dazelkey-lockup-compact.png';
import './Header.css';

function Header({ title, profile, onAddBucket, onOpenProfile }) {
  return (
    <motion.header
      className="topbar"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(dashboardEntrance.header)}
    >
      <div className="brand-wrap">
        <motion.button
          type="button"
          className="brand-mark"
          onClick={onOpenProfile}
          aria-label={profile?.name ? `Edit profile — ${profile.name}` : 'Edit profile'}
          style={profile?.photo ? { backgroundImage: `url(${profile.photo})` } : undefined}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ scale: 0.94, transition: spring.press }}
        >
          {!profile?.photo && getInitials(profile?.name)}
        </motion.button>
        <div className="brand-copy">
          <span className="eyebrow">Life archive</span>
          <h1 className="brand-wordmark">
            <img src={dazelkeyLockup} alt={title} className="brand-logo dazelkey-mark-inverted" />
          </h1>
        </div>
      </div>

      <motion.button
        type="button"
        className="glass-button"
        onClick={onAddBucket}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        + Add to The Bucket List
      </motion.button>
    </motion.header>
  );
}

export default Header;
