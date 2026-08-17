import { motion } from 'motion/react';
import { spring, dashboardEntrance, entranceTransition } from '../styles/motion';
import './Header.css';

function getInitials(name) {
  if (!name) {
    return 'LA';
  }
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'LA';
}

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
          <h1>{title}</h1>
        </div>
      </div>

      <motion.button
        type="button"
        className="glass-button"
        onClick={onAddBucket}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        + Add to What’s ahead
      </motion.button>
    </motion.header>
  );
}

export default Header;
