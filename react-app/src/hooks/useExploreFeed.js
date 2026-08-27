import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/*
  Real backend now: reads other people's rows from the shared
  `achievements` table (react-app/supabase/achievements.sql), which RLS
  already limits to rows the signed-in user is allowed to see (their own,
  or a friend's who has Achievement sharing on). ExploreFeed still narrows
  that down to accepted friends only (see its own comment for why), so
  self-rows returned here are simply filtered out there.

  "Inspired" is a real, shared tally now too (achievement_inspirations),
  not a local-only toggle -- toggleInspired writes through immediately
  and updates local state optimistically so the tap feels instant.
*/
export function useExploreFeed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const refresh = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    setCurrentUserId(user?.id || null);
    if (!user) {
      setFeed([]);
      setLoading(false);
      return;
    }

    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id, user_id, title, mode, place, completed_date, image')
      .neq('user_id', user.id)
      .order('completed_date', { ascending: false });
    if (error) {
      console.warn('Unable to load the Explore feed.', error);
      setFeed([]);
      setLoading(false);
      return;
    }

    if (!achievements || achievements.length === 0) {
      setFeed([]);
      setLoading(false);
      return;
    }

    const authorIds = [...new Set(achievements.map((row) => row.user_id))];
    const achievementIds = achievements.map((row) => row.id);

    const [{ data: profiles }, { data: inspirations }] = await Promise.all([
      supabase.from('public_profiles').select('user_id, name, handle, photo').in('user_id', authorIds),
      supabase.from('achievement_inspirations').select('achievement_id, user_id').in('achievement_id', achievementIds),
    ]);

    const profileByUserId = Object.fromEntries((profiles || []).map((profile) => [profile.user_id, profile]));
    const inspiredCountById = {};
    const myInspiredIds = new Set();
    (inspirations || []).forEach((row) => {
      inspiredCountById[row.achievement_id] = (inspiredCountById[row.achievement_id] || 0) + 1;
      if (row.user_id === user.id) {
        myInspiredIds.add(row.achievement_id);
      }
    });

    setFeed(
      achievements.map((row) => {
        const authorProfile = profileByUserId[row.user_id];
        return {
          id: row.id,
          user: {
            id: row.user_id,
            name: authorProfile?.name || 'Someone',
            handle: authorProfile?.handle ? `@${authorProfile.handle}` : '',
            avatar: authorProfile?.photo || null,
          },
          image: row.image,
          title: row.title,
          mode: row.mode,
          place: row.place,
          completedDate: row.completed_date,
          isInspired: myInspiredIds.has(row.id),
          inspiredCount: inspiredCountById[row.id] || 0,
        };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggleInspired(id) {
    if (!currentUserId) {
      return;
    }
    const post = feed.find((item) => item.id === id);
    if (!post) {
      return;
    }
    const wasInspired = post.isInspired;
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isInspired: !wasInspired, inspiredCount: item.inspiredCount + (wasInspired ? -1 : 1) }
          : item,
      ),
    );

    const { error } = wasInspired
      ? await supabase.from('achievement_inspirations').delete().eq('achievement_id', id).eq('user_id', currentUserId)
      : await supabase.from('achievement_inspirations').insert({ achievement_id: id, user_id: currentUserId });

    if (error) {
      console.warn('Unable to update Inspired.', error);
      await refresh();
    }
  }

  return { feed, loading, toggleInspired, refresh };
}
