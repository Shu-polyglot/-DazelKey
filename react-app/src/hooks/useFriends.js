import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Real friend-graph backend, replacing the old local-only handle array.
// Friendships are mutual-approval: sendRequest creates a 'pending' row,
// the addressee accepts or declines it, and only 'accepted' rows count
// as an actual friendship (see isFriend/friends below).
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
    friendships: acceptedFriendships,
    incomingRequests,
    outgoingRequests,
    sendRequest,
    respondToRequest,
    removeFriendship,
    statusWith,
    isFriend,
    refresh,
  };
}
