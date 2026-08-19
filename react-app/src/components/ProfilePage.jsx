import { motion } from 'motion/react';
import { getInitials, getSocialPlatformLabel } from '../lib/profile';
import { entranceTransition, spring } from '../styles/motion';
import './ProfilePage.css';

// Pure display of the same profile data Header's brand-mark and
// ProfilePanel already read/write -- editing still happens through that
// existing modal (passed in via onEditProfile), not rebuilt here.
function ProfilePage({ profile, onEditProfile }) {
  const hasPhoto = Boolean(profile?.photo);

  return (
    <motion.section
      className="panel profile-page"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(0.12)}
    >
      <p className="panel-label">Profile</p>

      <div className="profile-page-body">
        <div
          className="profile-avatar"
          style={hasPhoto ? { backgroundImage: `url(${profile.photo})` } : undefined}
        >
          {!hasPhoto && <span>{getInitials(profile?.name)}</span>}
        </div>

        <div className="profile-page-info">
          <h2 className="profile-page-name">{profile?.name || 'Your name'}</h2>
          {profile?.role ? <p className="profile-page-role">{profile.role}</p> : null}
          {profile?.age ? <p className="profile-page-age">{profile.age} years old</p> : null}
        </div>

        {profile?.bio ? <p className="profile-page-bio">{profile.bio}</p> : null}

        {profile?.socialLinks?.length > 0 && (
          <div className="profile-page-links">
            {profile.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-page-link"
              >
                {getSocialPlatformLabel(link.platform)}
              </a>
            ))}
          </div>
        )}

        <motion.button
          type="button"
          className="secondary-button profile-page-edit"
          onClick={onEditProfile}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          Edit profile
        </motion.button>
      </div>
    </motion.section>
  );
}

export default ProfilePage;
