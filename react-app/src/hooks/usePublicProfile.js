import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isValidHandle(handle) {
  return HANDLE_PATTERN.test(handle || '');
}

// Small, curated word lists (not a full username generator) -- just
// enough that a brand-new user's auto-assigned handle reads as a name
// rather than an opaque id, while every combination still fits the
// 20-character limit above with room to spare.
const HANDLE_ADJECTIVES = ['quiet', 'calm', 'swift', 'bright', 'gentle', 'bold', 'warm', 'steady', 'clear', 'still'];
const HANDLE_NOUNS = ['harbor', 'river', 'ember', 'meadow', 'summit', 'horizon', 'lantern', 'compass', 'tide', 'maple'];

function generateRandomHandle() {
  const adjective = HANDLE_ADJECTIVES[Math.floor(Math.random() * HANDLE_ADJECTIVES.length)];
  const noun = HANDLE_NOUNS[Math.floor(Math.random() * HANDLE_NOUNS.length)];
  const suffix = Math.floor(Math.random() * 900 + 100);
  return `${adjective}_${noun}${suffix}`;
}

// Retries on a handle collision (Postgres unique_violation, 23505) --
// astronomically unlikely with this word-list size, but cheap to
// handle. Gives up and returns null after a few tries rather than
// looping forever.
async function createProfileWithRandomHandle(userId, attemptsLeft = 5) {
  if (attemptsLeft <= 0) {
    return null;
  }
  const { data, error } = await supabase
    .from('public_profiles')
    .insert({ user_id: userId, handle: generateRandomHandle() })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') {
      return createProfileWithRandomHandle(userId, attemptsLeft - 1);
    }
    console.warn('Unable to auto-create public profile.', error);
    return null;
  }
  return data;
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
    if (data) {
      setPublicProfile(data);
      setLoading(false);
      return;
    }
    // No row yet -- brand-new user, or an existing one who never set a
    // username. Auto-assign a random handle immediately so invite links
    // and the friends system work without a trip to Settings first;
    // saveHandleAndProfile below still lets anyone rename it.
    const created = await createProfileWithRandomHandle(user.id);
    setPublicProfile(created);
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

// Read-only lookup of someone else's public profile by their auth user
// id (not handle) -- used to show a requester's name/photo in a friend
// request list, where we only have their user_id.
export async function lookupPublicProfileByUserId(userId) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.warn(`Unable to look up user "${userId}".`, error);
    return null;
  }
  return data;
}
