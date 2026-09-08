import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Runs at most once per app session (see startedRef below), classifying
// a handful of still-unclassified open Buckets via the
// classify-bucket-difficulty Edge Function -- never blocking anything,
// never asked of the user (see that function's own header comment on
// why this stays four small enums instead of a form to fill in).
// Called once from App.jsx (not per-page) so it isn't re-triggered by
// every tab switch.
const MAX_PER_SESSION = 3;

export function useBucketDifficulty(buckets, updateBucket) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || buckets.length === 0) {
      return undefined;
    }
    startedRef.current = true;

    const pending = buckets.filter((bucket) => bucket.status !== 'completed' && !bucket.difficulty).slice(0, MAX_PER_SESSION);
    if (pending.length === 0) {
      return undefined;
    }

    let cancelled = false;

    async function classifyNext(index) {
      if (cancelled || index >= pending.length) {
        return;
      }
      const bucket = pending[index];
      try {
        const { data, error } = await supabase.functions.invoke('classify-bucket-difficulty', {
          body: { title: bucket.title, place: bucket.place, message: bucket.message },
        });
        if (!cancelled && !error && data?.difficulty) {
          updateBucket(bucket.id, { difficulty: data.difficulty });
        }
      } catch (err) {
        console.warn(`Unable to classify difficulty for Bucket "${bucket.title}".`, err);
      }
      await classifyNext(index + 1);
    }

    classifyNext(0);
    return () => {
      cancelled = true;
    };
  }, [buckets, updateBucket]);
}
