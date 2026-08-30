import { useEffect, useState } from 'react';
import { lookupPublicProfileByHandle } from '../../hooks/usePublicProfile';
import { useFriends } from '../../hooks/useFriends';
import { supabase } from '../../lib/supabase';

// Full-screen takeover for a shared invite link (#/add-friend/handle) --
// see useRoute's readAddFriendHandleFromHash. Looks up the target
// profile and connects automatically, with no separate "send request"
// tap: someone's own invite link IS the consent handshake (see
// useFriends' connectInstantly), unlike the general add-from-Explore
// path, which still goes through pending/accept.
function AddFriendScreen({ handle, onDone }) {
  const [targetProfile, setTargetProfile] = useState(undefined); // undefined = loading, null = not found
  const [currentUserId, setCurrentUserId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error | self
  const { connectInstantly, statusWith } = useFriends();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (cancelled) return;
      setCurrentUserId(userData?.user?.id || null);

      const found = await lookupPublicProfileByHandle(handle);
      if (cancelled) return;
      setTargetProfile(found);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  // Fires once both the target profile and the current user's friend
  // graph are ready, and only from 'idle' -- so a re-render (statusWith/
  // connectInstantly/refresh all come from useFriends and are new
  // functions each render) never restarts an already in-flight or
  // finished connection attempt.
  useEffect(() => {
    if (!targetProfile || !currentUserId || status !== 'idle') {
      return;
    }
    if (targetProfile.user_id === currentUserId) {
      setStatus('self');
      return;
    }
    if (statusWith(targetProfile.user_id) === 'friends') {
      setStatus('connected');
      return;
    }
    let cancelled = false;
    async function connect() {
      setStatus('connecting');
      const { error } = await connectInstantly(targetProfile.user_id);
      if (cancelled) return;
      setStatus(error ? 'error' : 'connected');
    }
    connect();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProfile, currentUserId, status]);

  let body;
  if (targetProfile === undefined) {
    body = <p>Looking up @{handle}…</p>;
  } else if (targetProfile === null) {
    body = <p>No one found with the username @{handle}.</p>;
  } else if (status === 'self') {
    body = <p>This is your own invite link.</p>;
  } else if (status === 'error') {
    body = <p>Something went wrong. Try again.</p>;
  } else {
    const name = targetProfile.name || `@${handle}`;
    body = (
      <>
        <span
          className="explore-card-avatar"
          style={{
            backgroundImage: `url(${targetProfile.photo || ''})`,
            width: '72px',
            height: '72px',
            display: 'inline-block',
            borderRadius: '50%',
            backgroundColor: '#eee',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <h2 style={{ margin: '16px 0 4px' }}>{name}</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>@{handle}</p>
        <p>
          {status === 'connecting' && 'Connecting…'}
          {status === 'connected' && `You're now connected with ${name}.`}
        </p>
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      {body}
      <button
        type="button"
        className="secondary-button"
        style={{ marginTop: '24px' }}
        onClick={onDone}
      >
        Back to DazelKey
      </button>
    </div>
  );
}

export default AddFriendScreen;
