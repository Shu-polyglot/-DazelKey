import { normalizeBucket } from './buckets';

const LEGACY_STORAGE_KEY = 'life-os-buckets-v1';

/*
  category -> mode: no old category reliably signals solo/together. Travel
  and Personal are just as often solo as together; Career/Learning/
  Experience say nothing about company at all. Guessing per-category would
  be an arbitrary assumption, not a real conversion -- so every migrated
  bucket gets this same documented safe default instead.
*/
const MIGRATED_MODE_DEFAULT = 'solo';

/*
  dateType/targetDate -> when: derived from the actual planned date rather
  than defaulted blindly, since the user already told us how urgent they
  considered it. A someday bucket had no real date to reason from, so it
  maps directly to the deepest horizon -- the old "someday" and the new
  "beforeIDie" are the same intent under a renamed label.
*/
function deriveWhenFromLegacyDate(bucket) {
  if (bucket.dateType !== 'exact' || !bucket.targetDate) {
    return 'beforeIDie';
  }

  const target = new Date(`${bucket.targetDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) {
    return 'beforeIDie';
  }

  const now = new Date();
  const daysAway = (target - now) / (1000 * 60 * 60 * 24);

  if (daysAway <= 90) {
    return 'soon';
  }
  if (target.getFullYear() === now.getFullYear()) {
    return 'thisYear';
  }
  return 'longTerm';
}

function migrateLegacyBucket(bucket, index) {
  // memory/description consolidate into message -- memory preferred (it's
  // closer in spirit to a message to a future self), description used only
  // when memory was never filled in, so no old note text is silently lost.
  const message = bucket.memory || bucket.description || '';

  return normalizeBucket(
    {
      id: bucket.id,
      title: bucket.title,
      mode: MIGRATED_MODE_DEFAULT,
      when: deriveWhenFromLegacyDate(bucket),
      place: bucket.location || '',
      message,
      status: bucket.status,
      completedDate: bucket.completedDate || null,
      image: bucket.image || null,
    },
    index,
  );
}

/*
  Runs once, only if the new-shape key has never been written. The legacy
  key is read, never modified, and never deleted -- it stays in
  localStorage as the safety net for anything this mapping ever gets
  wrong.
*/
export function loadMigratedBuckets() {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) {
      return null;
    }

    const legacyBuckets = JSON.parse(legacyRaw);
    if (!Array.isArray(legacyBuckets) || legacyBuckets.length === 0) {
      return null;
    }

    return legacyBuckets.map(migrateLegacyBucket);
  } catch (error) {
    console.warn('Unable to migrate legacy buckets.', error);
    return null;
  }
}
