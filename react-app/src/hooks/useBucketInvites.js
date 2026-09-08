import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// "誘う" -- inviting an already-accepted friend into one of your own
// Bucket List intentions (see supabase/bucket_invites.sql for why this
// is a structured invite/accept object rather than a DM/chat feature).
// Buckets themselves live in each user's own private user_state JSON
// (see useBuckets), invisible to anyone else under RLS -- accepting an
// invite is the caller's job (create a new Bucket from the snapshot via
// addBucket), not this hook's, since this hook has no access to the
// buckets domain.
export function useBucketInvites() {
  const [invites, setInvites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setInvites([]);
      setCurrentUserId(null);
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);
    const { data, error } = await supabase
      .from('bucket_invites')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
    if (error) {
      console.warn('Unable to load bucket invites.', error);
    }
    setInvites(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Upserted (not inserted) on the (from, to, source bucket) triple --
  // see bucket_invites.sql's unique_bucket_invite -- so re-inviting the
  // same friend to the same Bucket after a decline flips the same row
  // back to 'pending' instead of erroring.
  async function sendInvite(toUserId, bucket) {
    if (!currentUserId) {
      return { error: { message: 'Not signed in.' } };
    }
    const { error } = await supabase.from('bucket_invites').upsert(
      {
        from_user_id: currentUserId,
        to_user_id: toUserId,
        source_bucket_id: bucket.id,
        title: bucket.title,
        place: bucket.place || '',
        bucket_when: bucket.when,
        message: bucket.message || '',
        status: 'pending',
      },
      { onConflict: 'from_user_id,to_user_id,source_bucket_id' },
    );
    if (!error) {
      await refresh();
    }
    return { error };
  }

  async function respondToInvite(id, accepted) {
    const { error } = await supabase
      .from('bucket_invites')
      .update({ status: accepted ? 'accepted' : 'declined' })
      .eq('id', id);
    if (!error) {
      await refresh();
    }
    return { error };
  }

  async function cancelInvite(id) {
    const { error } = await supabase.from('bucket_invites').delete().eq('id', id);
    if (!error) {
      await refresh();
    }
    return { error };
  }

  const incomingInvites = invites.filter((invite) => invite.to_user_id === currentUserId && invite.status === 'pending');

  // Every invite (any status) this user sent for one specific Bucket --
  // lets BucketInviteModal grey out a friend it's already pending/
  // accepted with instead of offering to invite them twice.
  function outgoingForBucket(bucketId) {
    return invites.filter((invite) => invite.from_user_id === currentUserId && invite.source_bucket_id === bucketId);
  }

  return { incomingInvites, outgoingForBucket, sendInvite, respondToInvite, cancelInvite, loading };
}
