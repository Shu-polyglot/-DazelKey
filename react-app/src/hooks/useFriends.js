import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Real friend-graph backend, replacing the old local-only handle array.
// Two ways to connect: sendRequest is mutual-approval (a 'pending' row
// the addressee has to accept/decline -- see FriendRequestsPanel, and
// ExploreFeed's own add-friend button), while connectInstantly skips
// straight to 'accepted' for AddFriendScreen's invite-link flow. Only
// 'accepted' rows count as an actual friendship (see isFriend/friends
// below) either way.
export function useFriends() {
  const [friendships, setFriendships] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setFriendships([]);
      setCurrentUserId(null);
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    if (error) {
      console.warn('Unable to load friendships.', error);
    }
    setFriendships(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendRequest(otherUserId) {
    if (!currentUserId) {
      return { error: { message: 'Not signed in.' } };
    }
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: currentUserId, addressee_id: otherUserId });
    if (!error) {
      await refresh();
    }
    return { error };
  }

  async function upgradeToAccepted(row) {
    if (row.status === 'accepted') {
      return { error: null };
    }
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', row.id);
    if (!error) {
      await refresh();
    }
    return { error };
  }

  // For AddFriendScreen's invite-link flow specifically -- tapping
  // someone's own invite link is itself the consent handshake, so this
  // skips the pending/accept step sendRequest above goes through for
  // the general (Explore) add-friend path. Handles every existing-row
  // shape: no row yet (insert straight to 'accepted'), an already-
  // accepted row (no-op), or a pending row in EITHER direction --
  // requester/addressee is a directional pair, so a request the other
  // person already sent isn't found by re-inserting, it has to be
  // updated -- upgrade it instead of trying to insert a duplicate.
  async function connectInstantly(otherUserId) {
    if (!currentUserId) {
      return { error: { message: 'Not signed in.' } };
    }
    const existing = friendships.find(
      (f) => f.requester_id === otherUserId || f.addressee_id === otherUserId,
    );
    if (existing) {
      return upgradeToAccepted(existing);
    }
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: currentUserId, addressee_id: otherUserId, status: 'accepted' });
    if (!error) {
      await refresh();
      return { error: null };
    }
    if (error.code !== '23505') {
      return { error };
    }
    // Local `friendships` state was stale -- the same invite link
    // tapped twice in a row (e.g. a page refresh), or this insert lost
    // a race with the initial fetch this hook's own mount kicked off.
    // A row genuinely exists server-side even though we didn't find it
    // above; look it up directly rather than trusting `friendships`
    // again, and upgrade whatever's there instead of surfacing this as
    // a failure.
    const { data: row, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${otherUserId}),` +
          `and(requester_id.eq.${otherUserId},addressee_id.eq.${currentUserId})`,
      )
      .maybeSingle();
    if (fetchError || !row) {
      return { error: fetchError || error };
    }
    return upgradeToAccepted(row);
  }

  async function respondToRequest(friendshipId, accept) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', friendshipId);
    if (!error) {
      await refresh();
    }
    return { error };
  }

  async function removeFriendship(friendshipId) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (!error) {
      await refresh();
    }
    return { error };
  }

  function statusWith(otherUserId) {
    const row = friendships.find(
      (f) => f.requester_id === otherUserId || f.addressee_id === otherUserId,
    );
    if (!row) {
      return 'none';
    }
    if (row.status === 'accepted') {
      return 'friends';
    }
    if (row.status === 'pending') {
      return row.requester_id === currentUserId ? 'requested' : 'incoming';
    }
    return 'none';
  }

  function isFriend(otherUserId) {
    return statusWith(otherUserId) === 'friends';
  }

  const acceptedFriendships = friendships.filter((f) => f.status === 'accepted');
  const incomingRequests = friendships.filter(
    (f) => f.status === 'pending' && f.addressee_id === currentUserId,
  );
  const outgoingRequests = friendships.filter(
    (f) => f.status === 'pending' && f.requester_id === currentUserId,
  );

  return {
    loading,
    currentUserId,
    friendships: acceptedFriendships,
    incomingRequests,
    outgoingRequests,
    sendRequest,
    connectInstantly,
    respondToRequest,
    removeFriendship,
    statusWith,
    isFriend,
    refresh,
  };
}
