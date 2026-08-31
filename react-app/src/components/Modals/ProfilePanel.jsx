import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Modal from './Modal';
import PhotoCropper from '../shared/PhotoCropper';
import ToggleSwitch from '../shared/ToggleSwitch';
import TraitQuiz from '../Strategy/TraitQuiz';
import RadarChart from '../Strategy/RadarChart';
import { spring } from '../../styles/motion';
import {
  SOCIAL_PLATFORMS,
  EDITABLE_SHARE_SECTIONS,
  getSocialPlatform,
  normalizeSocialUrl,
  isTraitQuizStale,
} from '../../lib/profile';
import { isValidHandle } from '../../hooks/usePublicProfile';
import { formatDate } from '../../lib/dates';
import '../Strategy/Strategy.css';
import './Modals.css';
import './ProfilePanel.css';

const MIN_AGE = 1;
const MAX_AGE = 119;

// Maps lib/profile.js's SHARE_SECTIONS keys onto public_profiles' column
// names (see supabase/public_profiles_and_friends.sql).
const SHARE_COLUMN_BY_KEY = {
  bucketLists: 'share_bucket_lists',
  achievement: 'share_achievement',
  core: 'share_core',
  traits: 'share_traits',
};

function ProfilePanel({ profile, publicProfile, onSaveTraitQuiz, onClose, onSave, onSavePublicProfile }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const inviteLink = publicProfile?.handle
    ? `${window.location.origin}${window.location.pathname}#/add-friend/${publicProfile.handle}`
    : null;

  function handleCopyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const hasTakenQuiz = Boolean(profile?.traitQuizTakenAt);
  const quizIsStale = isTraitQuizStale(profile);

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ?? '');
  const [photo, setPhoto] = useState(profile?.photo || null);
  const [bio, setBio] = useState(profile?.bio || '');
  const [role, setRole] = useState(profile?.role || '');
  const [handle, setHandle] = useState(publicProfile?.handle || '');
  const [handleError, setHandleError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState(() => (profile?.socialLinks || []).map((link) => ({ ...link })));
  const [shareSettings, setShareSettings] = useState(() => ({ ...profile?.shareSettings }));
  const [cropSource, setCropSource] = useState(null);
  const fileInputRef = useRef(null);

  function toggleShareSection(key) {
    setShareSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    setCropSource(URL.createObjectURL(file));
  }

  function handleCropConfirm(dataUrl) {
    setPhoto(dataUrl);
    URL.revokeObjectURL(cropSource);
    setCropSource(null);
  }

  function handleCropCancel() {
    URL.revokeObjectURL(cropSource);
    setCropSource(null);
  }

  function addSocialLink(platformId) {
    setSocialLinks((prev) => [...prev, { id: `social-${Date.now()}-${platformId}`, platform: platformId, url: '' }]);
  }

  function updateSocialLinkUrl(id, url) {
    setSocialLinks((prev) => prev.map((link) => (link.id === id ? { ...link, url } : link)));
  }

  function removeSocialLink(id) {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  }

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (platform) => !socialLinks.some((link) => link.platform === platform.id),
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setHandleError('');

    const trimmedName = name.trim();
    const parsedAge = Number(age);
    const validAge = Number.isInteger(parsedAge) && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE ? parsedAge : null;
    const trimmedHandle = handle.trim().toLowerCase();

    if (trimmedHandle && !isValidHandle(trimmedHandle)) {
      setHandleError('Use 3-20 lowercase letters, numbers, or underscores.');
      return;
    }

    setIsSaving(true);

    if (trimmedHandle && onSavePublicProfile) {
      const shareColumns = Object.fromEntries(
        Object.entries(SHARE_COLUMN_BY_KEY).map(([key, column]) => [column, Boolean(shareSettings[key])]),
      );
      const { error } = await onSavePublicProfile({
        handle: trimmedHandle,
        name: trimmedName,
        photo,
        bio: bio.trim(),
        role: role.trim(),
        ...shareColumns,
      });
      if (error) {
        setIsSaving(false);
        setHandleError(error.message || 'Unable to save your username.');
        return;
      }
    }

    onSave({
      name: trimmedName,
      age: validAge,
      photo,
      bio: bio.trim(),
      role: role.trim(),
      socialLinks: socialLinks
        .map((link) => ({ ...link, url: normalizeSocialUrl(link.url) }))
        .filter((link) => link.url),
      shareSettings,
    });
    setIsSaving(false);
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-header profile-panel-header">
        <h3>Your profile</h3>
      </div>

      <div className="profile-trait-section">
        {hasTakenQuiz && <RadarChart scores={profile.traitScores} />}

        <motion.button
          type="button"
          className="secondary-button trait-quiz-entry-button"
          onClick={() => setIsQuizOpen(true)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          {hasTakenQuiz ? 'Retake the Trait Quiz' : 'Take the Trait Quiz'}
        </motion.button>

        {hasTakenQuiz && (
          <p className="profile-trait-quiz-meta">
            Last taken {formatDate(profile.traitQuizTakenAt)}
            {quizIsStale ? ' -- it\'s been a while, maybe check back in?' : ''}
          </p>
        )}
      </div>

      <form className="detail-form" onSubmit={handleSubmit} noValidate>
        <button
          type="button"
          className="profile-photo-button"
          onClick={() => fileInputRef.current?.click()}
          style={photo ? { backgroundImage: `url(${photo})` } : undefined}
          aria-label={photo ? 'Change photo' : 'Upload a photo'}
        >
          {!photo && <span>+</span>}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="photo-input" onChange={handleFile} />

        <label className="detail-form-label">
          <span>Name</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>

        <label className="detail-form-label">
          <span>Username</span>
          <input
            type="text"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="e.g. taro_yamada"
          />
          <span className="profile-share-hint">
            Lets others find you (lowercase letters, numbers, underscores, 3-20 characters). You were given a random one to start -- change it any time.
          </span>
          {handleError && <span className="profile-share-hint" style={{ color: '#d33' }}>{handleError}</span>}
        </label>

        <label className="detail-form-label">
          <span>Age</span>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Your age"
            min={MIN_AGE}
            max={MAX_AGE}
          />
        </label>

        <label className="detail-form-label">
          <span>Role</span>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Product Designer"
          />
        </label>

        <label className="detail-form-label">
          <span>Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="A short line about you"
            rows={3}
          />
        </label>

        <div className="detail-form-label">
          <span>Social Links</span>

          {socialLinks.length > 0 && (
            <div className="social-links-editor">
              {socialLinks.map((link) => {
                const platform = getSocialPlatform(link.platform);
                return (
                  <div className="social-link-row" key={link.id}>
                    <span className="social-link-platform">{platform?.label || link.platform}</span>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(event) => updateSocialLinkUrl(link.id, event.target.value)}
                      placeholder={platform?.placeholder || 'https://'}
                    />
                    <button
                      type="button"
                      className="icon-button social-link-remove"
                      onClick={() => removeSocialLink(link.id)}
                      aria-label={`Remove ${platform?.label || link.platform}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {availablePlatforms.length > 0 && (
            <div className="social-link-add-row">
              {availablePlatforms.map((platform) => (
                <button
                  type="button"
                  key={platform.id}
                  className="social-link-add-button"
                  onClick={() => addSocialLink(platform.id)}
                >
                  + {platform.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {inviteLink && (
          <div className="profile-share-section detail-form-label">
            <span>Your Invite Link</span>
            <p className="profile-share-hint">Share this so a friend can add you.</p>
            <motion.button
              type="button"
              className="secondary-button"
              onClick={handleCopyLink}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
            >
              {linkCopied ? 'Copied!' : 'Copy Invite Link'}
            </motion.button>
          </div>
        )}

        <div className="profile-share-section detail-form-label">
          <span>Shareable Profile</span>
          <p className="profile-share-hint">
            Choose what shows up in your profile preview. Everything starts private.
          </p>
          <div className="profile-share-list">
            {EDITABLE_SHARE_SECTIONS.map((section) => (
              <div className="profile-share-row" key={section.key}>
                <span>{section.label}</span>
                <ToggleSwitch
                  checked={shareSettings[section.key]}
                  onChange={() => toggleShareSection(section.key)}
                  label={`Share ${section.label}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <motion.button
            type="button"
            className="secondary-button"
            onClick={onClose}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="primary-button"
            disabled={isSaving}
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </motion.button>
        </div>
      </form>

      {cropSource && <PhotoCropper imageSrc={cropSource} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}

      {createPortal(
        <AnimatePresence>
          {isQuizOpen && (
            <TraitQuiz key="trait-quiz" onComplete={onSaveTraitQuiz} onClose={() => setIsQuizOpen(false)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Modal>
  );
}

export default ProfilePanel;
