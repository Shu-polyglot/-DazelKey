import { useEffect, useState } from 'react';

// `legacyKey` is a one-time read-only fallback for data saved under the
// app's pre-rename key (Life OS -> DazelKey): read once if `key` has
// never been written, never modified, never deleted -- same
// non-destructive pattern as lib/migrateBuckets.
export function useLocalStorage(key, initialValueFn, legacyKey) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }

      if (legacyKey) {
        const legacySaved = localStorage.getItem(legacyKey);
        if (legacySaved) {
          return JSON.parse(legacySaved);
        }
      }
    } catch (error) {
      console.warn(`Unable to load saved value for "${key}".`, error);
    }

    return initialValueFn();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Most commonly QuotaExceededError. Left uncaught, this throws from
      // inside a passive effect with no error boundary in the tree above
      // it, which crashes the whole app to a blank screen. In-memory state
      // (`value`) still holds the update, so the UI stays correct for this
      // session even though the write didn't persist.
      console.warn(`Unable to persist value for "${key}".`, error);
    }
  }, [key, value]);

  return [value, setValue];
}
