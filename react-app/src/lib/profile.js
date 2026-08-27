import { DIMENSIONS } from '../data/traits';

export function getInitials(name) {
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

/*
  Catalog of known social platforms. Adding support for a new platform is
  just adding an entry here -- the editor's "add link" row and the display
  labels both derive from this list, nothing else needs to change.
*/
export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourname' },
  { id: 'x', label: 'X', placeholder: 'https://x.com/yourname' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourname' },
];

export function getSocialPlatform(platformId) {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === platformId) || null;
}

export function getSocialPlatformLabel(platformId) {
  return getSocialPlatform(platformId)?.label || platformId;
}

/*
  Users can type a bare handle-ish URL without a protocol -- prepend
  https:// so the stored value is always a link that actually opens.
*/
export function normalizeSocialUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return '';
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function normalizeSocialLink(link, index) {
  return {
    id: link?.id || `social-${index}`,
    platform: link?.platform || 'other',
    url: normalizeSocialUrl(link?.url),
  };
}

// One entry per dimension, defaulting to 0 (no score yet) -- the radar
// chart in Profile always draws all 6 axes regardless of whether the
// quiz has ever been taken.
function defaultTraitScores() {
  return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));
}

function normalizeTraitScores(scores) {
  const safeScores = defaultTraitScores();
  DIMENSIONS.forEach((dimension) => {
    const value = scores?.[dimension];
    if (typeof value === 'number' && Number.isFinite(value)) {
      safeScores[dimension] = value;
    }
  });
  return safeScores;
}

// The Shareable Profile preview's four sections -- each defaults to
// off (see normalizeShareSettings) so a profile is never shown/shared
// wider than the user explicitly opted into.
export const SHARE_SECTIONS = [
  { key: 'bucketLists', label: 'Bucket Lists' },
  { key: 'achievement', label: 'Achievement' },
  { key: 'core', label: 'Core' },
  { key: 'traits', label: 'Trait diagnostic' },
];

// Edit Profile only lets a user toggle these two -- Core and Trait
// diagnostic keep their entries in SHARE_SECTIONS (and so in
// shareSettings/normalizeShareSettings) since PreviewProfile still reads
// share.core/share.traits; a profile that had either on before this
// change keeps showing that section, it just can no longer be flipped
// from the editor.
export const EDITABLE_SHARE_SECTIONS = SHARE_SECTIONS.filter(
  (section) => section.key === 'bucketLists' || section.key === 'achievement'
);

function defaultShareSettings() {
  return Object.fromEntries(SHARE_SECTIONS.map((section) => [section.key, false]));
}

function normalizeShareSettings(settings) {
  const safeSettings = defaultShareSettings();
  SHARE_SECTIONS.forEach((section) => {
    if (typeof settings?.[section.key] === 'boolean') {
      safeSettings[section.key] = settings[section.key];
    }
  });
  return safeSettings;
}

// How long before Profile's quiz section starts gently suggesting a
// retake -- not enforced, just a quiet nudge (see ProfilePanel).
export const TRAIT_QUIZ_STALE_DAYS = 90;

export function isTraitQuizStale(profile, days = TRAIT_QUIZ_STALE_DAYS) {
  if (!profile?.traitQuizTakenAt) {
    return false;
  }
  const takenMs = new Date(`${profile.traitQuizTakenAt}T00:00:00`).getTime();
  if (Number.isNaN(takenMs)) {
    return false;
  }
  const diffDays = (Date.now() - takenMs) / (1000 * 60 * 60 * 24);
  return diffDays >= days;
}

/*
  Back-compat for profiles saved before bio/role/socialLinks/trait-quiz
  results existed -- missing fields fall back to safe defaults instead
  of leaving them undefined, so older localStorage data keeps working
  unchanged.
*/
export function normalizeProfile(profile) {
  const safeLinks = Array.isArray(profile?.socialLinks)
    ? profile.socialLinks.map(normalizeSocialLink).filter((link) => link.url)
    : [];

  return {
    name: profile?.name || '',
    age: profile?.age ?? null,
    photo: profile?.photo || null,
    bio: profile?.bio || '',
    role: profile?.role || '',
    socialLinks: safeLinks,
    completed: Boolean(profile?.completed),
    // Trait Quiz results -- decoupled from Strategy's Become votes
    // entirely (see lib/radar.js); this is the only place they live.
    traitScores: normalizeTraitScores(profile?.traitScores),
    traitQuizTakenAt: profile?.traitQuizTakenAt || null,
    // Which sections the Shareable Profile preview (see
    // components/shared/PreviewProfile) shows -- see SHARE_SECTIONS above
    // for why every one of these defaults to false.
    shareSettings: normalizeShareSettings(profile?.shareSettings),
  };
}
