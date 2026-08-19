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

/*
  Back-compat for profiles saved before bio/role/socialLinks existed --
  missing fields fall back to safe defaults instead of leaving them
  undefined, so older localStorage data keeps working unchanged.
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
  };
}
