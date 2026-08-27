import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// The app remains usable as a local-only experience until these two public
// values are configured. A publishable key is safe in a browser; never put a
// service_role/secret key in a VITE_ variable.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export async function getCurrentUser() {
  if (!supabase) {
    return null;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }
  if (sessionData.session?.user) {
    return sessionData.session.user;
  }

  // Anonymous authentication gives every installation an authenticated user,
  // allowing RLS to protect private data without adding a sign-in screen to
  // the onboarding flow. An account-linking UI can be added later.
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw error;
  }
  return data.user;
}
