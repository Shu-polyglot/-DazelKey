import { useEffect, useState } from 'react';
import { getCurrentUser, isSupabaseConfigured, supabase } from '../lib/supabase';

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

  // localStorage remains an immediate offline cache. Once Supabase has been
  // configured, the same state is also hydrated from and saved to a private
  // row belonging to this installation's authenticated user.
  const [remoteReady, setRemoteReady] = useState(!isSupabaseConfigured);
  const [remoteUserId, setRemoteUserId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!supabase) {
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!user || cancelled) {
          return;
        }

        const { data, error } = await supabase
          .from('user_state')
          .select('value')
          .eq('user_id', user.id)
          .eq('state_key', key)
          .maybeSingle();
        if (error) {
          throw error;
        }

        if (data?.value !== undefined && !cancelled) {
          setValue(data.value);
        }
        if (!cancelled) {
          setRemoteUserId(user.id);
          setRemoteReady(true);
        }
      } catch (error) {
        // A misconfigured/offline backend must never prevent the local-first
        // app from opening. Keep the console detail for the developer.
        console.warn(`Unable to sync saved value for "${key}".`, error);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!supabase || !remoteReady || !remoteUserId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      supabase
        .from('user_state')
        .upsert({ user_id: remoteUserId, state_key: key, value })
        .then(({ error }) => {
          if (error) {
            console.warn(`Unable to back up saved value for "${key}".`, error);
          }
        });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [key, remoteReady, remoteUserId, value]);

  return [value, setValue];
}
