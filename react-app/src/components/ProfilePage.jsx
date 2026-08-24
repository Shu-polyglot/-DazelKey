import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import BucketListPanel from './BucketList/BucketListPanel';
import AchievementGallery from './Achievements/AchievementGallery';
import AboutManifesto from './shared/AboutManifesto';
import PreviewProfile from './shared/PreviewProfile';
import { getInitials, getSocialPlatformLabel } from '../lib/profile';
import { entranceTransition, spring } from '../styles/motion';
import './ProfilePage.css';

// A generic "share" pictogram (arrow up out of an open tray) in the
// app's own thin-stroke line style (see BottomNav's icon comment) --
// the same everywhere-recognizable motif most apps use for "share this",
// not any one platform's own glyph.
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 3 V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8 7 L12 3 L16 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12 V18.5 C5 19.6 5.9 20.5 7 20.5 H17 C18.1 20.5 19 19.6 19 18.5 V12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PROFILE_TABS = [
  { id: 'buckets', label: 'The Bucket Lists' },
  { id: 'achievements', label: 'The Achievement' },
];

// Pure display of the same profile data Header's brand-mark and
// ProfilePanel already read/write -- editing still happens through that
// existing modal (passed in via onEditProfile), not rebuilt here.
function ProfilePage({ profile, buckets, onUpdateBucket, onDeleteBucket, onCompleteBucket, onEditProfile }) {
  const hasPhoto = Boolean(profile?.photo);
  const [activeTab, setActiveTab] = useState('buckets');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

        <div className="profile-page-actions">
          <motion.button
            type="button"
            className="secondary-button profile-page-edit"
            onClick={onEditProfile}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
          >
            Edit profile
          </motion.button>

          <motion.button
            type="button"
            className="icon-button profile-page-share"
            aria-label="Preview shareable profile"
            onClick={() => setIsPreviewOpen(true)}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.9, transition: spring.press }}
          >
            <ShareIcon />
          </motion.button>
        </div>

        <button type="button" className="profile-page-about-link" onClick={() => setIsAboutOpen(true)}>
          About DazelKey
        </button>
      </div>

      <div className="profile-tabs" role="tablist" aria-label="Profile sections">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`profile-tab${activeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.span
                className="profile-tab-indicator"
                layoutId="profile-tab-indicator"
                transition={spring.soft}
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'buckets' ? (
        <BucketListPanel
          buckets={buckets}
          onUpdate={onUpdateBucket}
          onDelete={onDeleteBucket}
          onComplete={onCompleteBucket}
          sectionId="profile-bucket-list-section"
          layoutIdPrefix="profile-bucket-card-"
          baseDelay={0}
        />
      ) : (
        <AchievementGallery buckets={buckets} onUpdate={onUpdateBucket} onDelete={onDeleteBucket} baseDelay={0} />
      )}

      {/* Portaled to document.body -- same page-shell filter-trap reason
          every other fixed-position full-screen overlay in this app is
          (see App.jsx's own portal comment). */}
      {createPortal(
        <AnimatePresence>{isAboutOpen && <AboutManifesto key="about-manifesto" onClose={() => setIsAboutOpen(false)} />}</AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isPreviewOpen && (
            <PreviewProfile key="preview-profile" profile={profile} buckets={buckets} onClose={() => setIsPreviewOpen(false)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.section>
  );
}

export default ProfilePage;
