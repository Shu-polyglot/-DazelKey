import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
      console.warn(`Unable to persist value for "${key}".`, error);
    }
  }, [key, value]);

  // localStorage remains an immediate offline cache. The same state is
  // also hydrated from and saved to a private row belonging to the
  // signed-in user (see lib/supabase.js + App.jsx's login gate -- by the
  // time this hook runs, a user is always already authenticated).
  const [remoteReady, setRemoteReady] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }
        const user = data?.user;
        if (!user || cancelled) {
          return;
        }

        const { data: row, error } = await supabase
          .from('user_state')
          .select('value')
          .eq('user_id', user.id)
          .eq('state_key', key)
          .maybeSingle();
        if (error) {
          throw error;
        }

        if (row?.value !== undefined && !cancelled) {
          setValue(row.value);
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
    if (!remoteReady || !remoteUserId) {
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
