import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByHandle } from '../../hooks/usePublicProfile';
import { useFriends } from '../../hooks/useFriends';
import { supabase } from '../../lib/supabase';
import { spring } from '../../styles/motion';

// Full-screen takeover for a shared invite link (#/add-friend/handle) --
// see useRoute's readAddFriendHandleFromHash. Looks up the target
// profile, shows who it is, and sends a friend request on confirm.
function AddFriendScreen({ handle, onDone }) {
  const [targetProfile, setTargetProfile] = useState(undefined); // undefined = loading, null = not found
  const [currentUserId, setCurrentUserId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | self | already
  const { sendRequest, statusWith, refresh } = useFriends();

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

  useEffect(() => {
    if (!targetProfile || !currentUserId) {
      return;
    }
    if (targetProfile.user_id === currentUserId) {
      setStatus('self');
      return;
    }
    const existing = statusWith(targetProfile.user_id);
    if (existing === 'friends' || existing === 'requested') {
      setStatus('already');
    }
  }, [targetProfile, currentUserId, statusWith]);

  async function handleSend() {
    if (!targetProfile) return;
    setStatus('sending');
    const { error } = await sendRequest(targetProfile.user_id);
    if (error) {
      setStatus('error');
      return;
    }
    await refresh();
    setStatus('sent');
  }

  let body;
  if (targetProfile === undefined) {
    body = <p>Looking up @{handle}…</p>;
  } else if (targetProfile === null) {
    body = <p>No one found with the username @{handle}.</p>;
  } else if (status === 'self') {
    body = <p>This is your own invite link.</p>;
  } else if (status === 'already') {
    body = <p>You're already connected with {targetProfile.name || `@${handle}`}.</p>;
  } else if (status === 'sent') {
    body = <p>Friend request sent to {targetProfile.name || `@${handle}`}.</p>;
  } else {
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
        <h2 style={{ margin: '16px 0 4px' }}>{targetProfile.name || `@${handle}`}</h2>
        <p style={{ opacity: 0.7, marginBottom: '24px' }}>@{handle}</p>
        <motion.button
          type="button"
          className="primary-button"
          disabled={status === 'sending'}
          onClick={handleSend}
          whileHover={{ y: -2, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
        >
          {status === 'sending' ? 'Sending…' : 'Send Friend Request'}
        </motion.button>
        {status === 'error' && <p style={{ color: '#d33', marginTop: '12px' }}>Something went wrong. Try again.</p>}
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
