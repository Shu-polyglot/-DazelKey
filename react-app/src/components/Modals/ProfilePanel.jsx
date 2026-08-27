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
import { formatDate } from '../../lib/dates';
import '../Strategy/Strategy.css';
import './Modals.css';
import './ProfilePanel.css';

const MIN_AGE = 1;
const MAX_AGE = 119;

function ProfilePanel({ profile, onSaveTraitQuiz, onClose, onSave }) {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const hasTakenQuiz = Boolean(profile?.traitQuizTakenAt);
  const quizIsStale = isTraitQuizStale(profile);

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ?? '');
  const [photo, setPhoto] = useState(profile?.photo || null);
  const [bio, setBio] = useState(profile?.bio || '');
  const [role, setRole] = useState(profile?.role || '');
  const [socialLinks, setSocialLinks] = useState(() => (profile?.socialLinks || []).map((link) => ({ ...link })));
  // Defaults to whatever normalizeProfile already resolved onto `profile`
  // (see lib/profile.js) -- every section off until the user turns one on
  // here, same off-by-default rule PreviewProfile itself relies on.
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

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedAge = Number(age);
    const validAge = Number.isInteger(parsedAge) && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE ? parsedAge : null;

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
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-header profile-panel-header">
        <h3>Your profile</h3>
      </div>

      {/* Who you are, on your own quiet schedule -- fully decoupled from
          Strategy's daily Become votes (see RadarChart/lib/radar.js). A
          periodic self-check-in, not a live progress readout. */}
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

        {/* Off by default (see normalizeShareSettings) -- there's no
            backend yet to actually publish any of this (see
            PreviewProfile), but the setting itself is real and saved
            here so flipping a section on ahead of time costs nothing. */}
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
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
          >
            Save
          </motion.button>
        </div>
      </form>

      {cropSource && <PhotoCropper imageSrc={cropSource} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}

      {/* Portaled for the same reason every other modal in this app is --
          nesting a second fixed-position Modal directly under this one
          would get trapped by whichever ancestor Framer Motion happens to
          be mid-animating a transform/filter on. */}
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
