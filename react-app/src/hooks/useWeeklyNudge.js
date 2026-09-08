import { useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getNudgeCandidates, pickNudgeCandidate } from '../lib/weeklyNudge';
import { getIsoWeekKey } from '../lib/dates';

// New feature, no prior storage key to fall back to -- see
// useLocalStorage's legacyKey param (omitted here on purpose).
const STORAGE_KEY = 'dazelkey-weekly-nudge-v1';

// Caps how far back "already suggested" (see lib/weeklyNudge's
// pickNudgeCandidate) looks. Without a cap, someone who's used the app
// for years would eventually have every Bucket marked "already
// suggested" forever, collapsing the preference for fresh picks back
// into a plain random draw -- keeping only the most recent 50 keeps
// that preference meaningful indefinitely.
const MAX_SUGGESTED_IDS = 50;

function initialNudgeState() {
  return { weekKey: '', bucketId: null, dismissedIds: [], suggestedIds: [] };
}

export function useWeeklyNudge(buckets) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialNudgeState);

  const candidates = useMemo(() => getNudgeCandidates(buckets), [buckets]);

  // Re-picks whenever a new ISO week has started, or the saved pick has
  // fallen out of `candidates` (completed/deleted since). Returning the
  // same `prev` reference when neither is true lets React bail out of
  // re-rendering instead of looping.
  //
  // Depends on `state.bucketId`/`state.weekKey`, not just `candidates` --
  // useLocalStorage's own async Supabase hydrate (a separate effect) can
  // overwrite local state with a stale remote value *after* this effect
  // already ran once on mount, which a candidates-only dependency list
  // would never notice (candidates hadn't changed, so the effect
  // wouldn't re-fire to re-validate the clobbered pick). Re-running
  // whenever state itself changes -- for any reason -- closes that gap.
  useEffect(() => {
    setState((prev) => {
      const currentWeekKey = getIsoWeekKey();
      const isNewWeek = prev.weekKey !== currentWeekKey;
      const stillValid = !isNewWeek && candidates.some((bucket) => bucket.id === prev.bucketId);
      if (stillValid) {
        return prev;
      }

      const dismissedIds = isNewWeek ? [] : prev.dismissedIds;
      const bucketId = pickNudgeCandidate(candidates, { suggestedIds: prev.suggestedIds, excludeIds: dismissedIds });
      const suggestedIds = bucketId ? [...prev.suggestedIds, bucketId].slice(-MAX_SUGGESTED_IDS) : prev.suggestedIds;

      return { weekKey: currentWeekKey, bucketId, dismissedIds, suggestedIds };
    });
  }, [candidates, state.bucketId, state.weekKey, setState]);

  function dismissNudge() {
    setState((prev) => {
      const dismissedIds = prev.bucketId ? [...prev.dismissedIds, prev.bucketId] : prev.dismissedIds;
      const bucketId = pickNudgeCandidate(candidates, { suggestedIds: prev.suggestedIds, excludeIds: dismissedIds });
      const suggestedIds = bucketId ? [...prev.suggestedIds, bucketId].slice(-MAX_SUGGESTED_IDS) : prev.suggestedIds;

      return { ...prev, bucketId, dismissedIds, suggestedIds };
    });
  }

  const nudgeBucket = (state.bucketId && buckets.find((bucket) => bucket.id === state.bucketId)) || null;

  return { nudgeBucket, dismissNudge };
}
