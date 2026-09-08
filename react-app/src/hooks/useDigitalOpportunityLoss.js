import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getIsoWeekKey } from '../lib/dates';
import { pickOpportunityExamples } from '../lib/digitalOpportunityLoss';

// New feature, no prior storage key to fall back to -- see
// useLocalStorage's legacyKey param (omitted here on purpose).
const STORAGE_KEY = 'dazelkey-dol-seen-v1';

function initialState() {
  return { weekKey: '' };
}

// Once-per-ISO-week trigger for DigitalOpportunityLossRitual (see that
// component's own header comment). Only fires once there's at least one
// real, classified, in-season Bucket to show -- an empty reveal would
// just be an interruption with nothing behind it, so this stays silent
// until useBucketDifficulty has actually classified something.
export function useDigitalOpportunityLoss(buckets) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialState);
  const examples = useMemo(() => pickOpportunityExamples(buckets), [buckets]);
  const currentWeekKey = getIsoWeekKey();
  const shouldShow = state.weekKey !== currentWeekKey && examples.length > 0;

  function markSeen() {
    setState({ weekKey: currentWeekKey });
  }

  return { shouldShow, markSeen };
}
