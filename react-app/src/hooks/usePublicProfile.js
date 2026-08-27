import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isValidHandle(handle) {
  return HANDLE_PATTERN.test(handle || '');
}

// Manages the signed-in user's OWN public_profiles row: whether one
// exists yet, and create/update/checking a handle's availability.
// Reading someone ELSE's public profile by handle is a separate,
// simpler read-only lookup (see lookupPublicProfileByHandle below) --
// this hook is only for the current user's own row.
export function usePublicProfile() {
  const [publicProfile, setPublicProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setPublicProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) {
      console.warn('Unable to load public profile.', error);
    }
    setPublicProfile(data || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Returns { error } — error.code 'HANDLE_TAKEN' if the handle is
  // already in use by someone else (Postgres unique_violation, 23505).
  async function saveHandleAndProfile(patch) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return { error: { message: 'Not signed in.' } };
    }
    const { data, error } = await supabase
      .from('public_profiles')
      .upsert({ user_id: user.id, ...patch })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        return { error: { code: 'HANDLE_TAKEN', message: 'That username is already taken.' } };
      }
      return { error };
    }
    setPublicProfile(data);
    return { error: null };
  }

  return { publicProfile, loading, saveHandleAndProfile, refresh };
}

// Read-only lookup of someone else's public profile by handle. Returns
// null if no such handle exists (not an error -- just "not found").
export async function lookupPublicProfileByHandle(handle) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();
  if (error) {
    console.warn(`Unable to look up handle "${handle}".`, error);
    return null;
  }
  return data;
}
