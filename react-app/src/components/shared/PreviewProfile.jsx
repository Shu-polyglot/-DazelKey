import { motion } from 'motion/react';
import BucketListPanel from '../BucketList/BucketListPanel';
import AchievementGallery from '../Achievements/AchievementGallery';
import TopPrioritySection from '../../features/topPriority/TopPrioritySection';
import RadarChart from '../Strategy/RadarChart';
import { getInitials } from '../../lib/profile';
import { easing } from '../../styles/motion';
import '../ProfilePage.css';
import './PreviewProfile.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easing.standard } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: easing.exit } },
};

/*
  A self-view of what the Shareable Profile toggles (see ProfilePanel's
  "Shareable Profile" section, and lib/profile's normalizeShareSettings)
  would actually show -- not a real share surface. There is no backend
  yet to publish any of this to anyone else, hence the notice banner:
  this screen exists purely so the off/on choice in ProfilePanel has
  somewhere to preview its own effect before that backend exists.

  Every section below is read-only by construction: each of
  BucketListPanel/AchievementGallery/TopPriority accepts (or, for
  TopPriority, always owns) a `readOnly` mode that hides every mutating
  action -- see those components' own `readOnly` prop -- rather than this
  screen trying to strip callbacks after the fact.
*/
function PreviewProfile({ profile, buckets, onClose }) {
  const share = profile?.shareSettings || {};
  const hasPhoto = Boolean(profile?.photo);
  const hasTraitScores = Boolean(profile?.traitQuizTakenAt);
  const showTraits = share.traits && hasTraitScores;
  const hasAnySection = share.bucketLists || share.achievement || share.core || showTraits;

  return (
    <motion.div
      className="preview-profile"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
    >
      <div className="preview-profile-topbar">
        <span className="preview-profile-badge">Preview</span>
        <button type="button" className="secondary-button" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="preview-profile-notice">
        This is a preview — sharing isn't live yet. Only you can see this.
      </p>

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
      </div>

      {!hasAnySection && (
        <p className="preview-profile-empty">
          Nothing is shared yet. Turn a section on in Edit Profile → Shareable Profile to see it here.
        </p>
      )}

      {showTraits && (
        <section className="app-section preview-profile-section">
          <div className="section-heading">
            <span className="section-label">Identity</span>
            <h2>Trait diagnostic</h2>
          </div>
          <RadarChart scores={profile.traitScores} />
        </section>
      )}

      {share.bucketLists && (
        <BucketListPanel
          buckets={buckets}
          sectionId="preview-bucket-list-section"
          layoutIdPrefix="preview-bucket-card-"
          baseDelay={0}
          readOnly
        />
      )}

      {share.achievement && <AchievementGallery buckets={buckets} baseDelay={0} readOnly />}

      {share.core && <TopPrioritySection readOnly />}
    </motion.div>
  );
}

export default PreviewProfile;
