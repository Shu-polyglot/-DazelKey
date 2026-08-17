import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEY, defaultBuckets, normalizeBucket } from '../lib/buckets';

export function useBuckets() {
  const [storedBuckets, setStoredBuckets] = useLocalStorage(STORAGE_KEY, () =>
    defaultBuckets.map(normalizeBucket),
  );

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
      prev.map((bucket) => {
        if (bucket.id !== id) {
          return bucket;
        }

        return {
          ...bucket,
          status: 'completed',
          completedDate: chosenDate,
          targetDate: bucket.dateType === 'exact' ? bucket.targetDate || chosenDate : bucket.targetDate,
        };
      }),
    );
  }

  return { buckets, addBucket, updateBucket, deleteBucket, completeBucket };
}
