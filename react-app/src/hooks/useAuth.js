import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Tracks the current Supabase auth session app-wide. `session` is null
// while logged out, and holds the Supabase session object once a magic
// link has been clicked and the client has picked up the resulting auth
// state.
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}
