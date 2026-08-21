import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEY, defaultBuckets, normalizeBucket } from '../lib/buckets';
import { loadMigratedBuckets } from '../lib/migrateBuckets';
import { todayIso } from '../lib/dates';

export function useBuckets() {
  const [storedBuckets, setStoredBuckets] = useLocalStorage(STORAGE_KEY, () => {
    const migrated = loadMigratedBuckets();
    return migrated && migrated.length ? migrated : defaultBuckets.map(normalizeBucket);
  });

  const buckets = useMemo(
    () => (Array.isArray(storedBuckets) ? storedBuckets.map(normalizeBucket) : []),
    [storedBuckets],
  );

  function addBucket(input) {
    setStoredBuckets((prev) => [
      normalizeBucket({ ...input, id: Date.now(), status: 'planned', completedDate: null }),
      ...prev,
    ]);
  }

  function updateBucket(id, patch) {
    setStoredBuckets((prev) => prev.map((bucket) => (bucket.id === id ? { ...bucket, ...patch } : bucket)));
  }

  function deleteBucket(id) {
    setStoredBuckets((prev) => prev.filter((bucket) => bucket.id !== id));
  }

  function completeBucket(id, chosenDate, photo) {
    if (!chosenDate) {
      return;
    }

    setStoredBuckets((prev) =>
      prev.map((bucket) =>
        bucket.id === id
          ? { ...bucket, status: 'completed', completedDate: chosenDate, image: photo || bucket.image || null }
          : bucket,
      ),
    );
  }

  // A standalone completed entry, not tied to any existing Bucket --
  // used to log a Doing goal's 100%/milestone moment as its own
  // Achievement (see App.jsx) rather than marking the goal itself
  // "done" while it's still being tracked in Doing. Lands in the same
  // array/storage as every other Bucket, so the Achievement shelf,
  // calendar, and opening banner all pick it up with no extra wiring.
  function addAchievement(title, photo) {
    setStoredBuckets((prev) => [
      normalizeBucket({
        id: Date.now(),
        title,
        status: 'completed',
        completedDate: todayIso(),
        image: photo || null,
        mode: 'solo',
        when: 'beforeIDie',
        place: '',
        message: '',
        goalType: 'have',
      }),
      ...prev,
    ]);
  }

  return { buckets, addBucket, updateBucket, deleteBucket, completeBucket, addAchievement };
}
