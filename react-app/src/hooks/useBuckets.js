import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEY, defaultBuckets, normalizeBucket } from '../lib/buckets';
import { loadMigratedBuckets } from '../lib/migrateBuckets';

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

  function completeBucket(id, chosenDate) {
    if (!chosenDate) {
      return;
    }

    setStoredBuckets((prev) =>
      prev.map((bucket) => (bucket.id === id ? { ...bucket, status: 'completed', completedDate: chosenDate } : bucket)),
    );
  }

  return { buckets, addBucket, updateBucket, deleteBucket, completeBucket };
}
