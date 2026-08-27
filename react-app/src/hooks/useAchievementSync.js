import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Mirrors completed Buckets into the shared `achievements` table
// (react-app/supabase/achievements.sql) whenever the user has Achievement
// sharing turned on (see ProfilePanel's Shareable Profile toggles), so
// friends' Explore feeds can read them. Turning sharing off deletes every
// row this user owns there -- nothing sits server-side that the user
// didn't opt into. There's no local read-back: buckets/publicProfile stay
// the source of truth, this hook only ever pushes.
export function useAchievementSync(buckets, publicProfile) {
  useEffect(() => {
    let cancelled = false;

    async function sync() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user || cancelled) {
        return;
      }

      if (!publicProfile?.share_achievement) {
        const { error } = await supabase.from('achievements').delete().eq('user_id', user.id);
        if (error) {
          console.warn('Unable to clear shared achievements.', error);
        }
        return;
      }

      const completed = buckets.filter((bucket) => bucket.status === 'completed');
      const rows = completed.map((bucket) => ({
        user_id: user.id,
        bucket_id: bucket.id,
        title: bucket.title,
        mode: bucket.mode,
        place: bucket.place || null,
        completed_date: bucket.completedDate,
        image: bucket.image || null,
      }));

      if (rows.length > 0) {
        const { error } = await supabase.from('achievements').upsert(rows, { onConflict: 'user_id,bucket_id' });
        if (error) {
          console.warn('Unable to sync achievements.', error);
        }
      }

      let deleteQuery = supabase.from('achievements').delete().eq('user_id', user.id);
      if (completed.length > 0) {
        deleteQuery = deleteQuery.not('bucket_id', 'in', `(${completed.map((bucket) => bucket.id).join(',')})`);
      }
      const { error: deleteError } = await deleteQuery;
      if (deleteError) {
        console.warn('Unable to prune stale achievements.', deleteError);
      }
    }

    const timeoutId = window.setTimeout(sync, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [buckets, publicProfile?.share_achievement]);
}
