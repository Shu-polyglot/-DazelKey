/*
  Selects which of the user's own completed, photographed buckets the
  Achievement banner (see AchievementBanner.jsx) has to rotate through.
  There is no separate content store here -- complete a bucket with a
  photo and the banner reflects it automatically.
*/

const MAX_RECENT_ACHIEVEMENTS = 6;

function hasPhoto(bucket) {
  return typeof bucket.image === 'string' && bucket.image.trim().length > 0;
}

// Real life moments only -- completed buckets with a photo, most recent
// first, capped at however many the banner should cycle through.
export function pickOpeningAchievements(buckets) {
  return buckets
    .filter((bucket) => bucket.status === 'completed' && hasPhoto(bucket))
    .sort((a, b) => new Date(b.completedDate || 0) - new Date(a.completedDate || 0))
    .slice(0, MAX_RECENT_ACHIEVEMENTS)
    .map((bucket) => ({
      id: bucket.id,
      image: bucket.image,
      caption: (bucket.message && bucket.message.trim()) || bucket.title,
      title: bucket.title,
      date: bucket.completedDate,
    }));
}

// Whether the achievement banner has anything to show -- lets the caller
// skip straight from the title to the quote card for a user with no
// photographed achievements yet, rather than rendering an empty screen.
export function hasOpeningAchievements(buckets) {
  return pickOpeningAchievements(buckets).length > 0;
}
