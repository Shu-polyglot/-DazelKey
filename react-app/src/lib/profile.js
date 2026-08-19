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
