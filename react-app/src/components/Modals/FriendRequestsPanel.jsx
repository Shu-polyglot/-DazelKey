import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { spring } from '../../styles/motion';

// Small inline list inside ProfilePanel showing incoming friend requests
// (see useFriends' incomingRequests) with Accept/Decline actions. Each
// request only has the requester's user_id, so this looks up their
// public profile (name/handle) to display something recognizable.
function FriendRequestsPanel({ incomingRequests, onRespond }) {
  const [profilesById, setProfilesById] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      const entries = await Promise.all(
        incomingRequests.map(async (request) => {
          const profile = await lookupPublicProfileByUserId(request.requester_id);
          return [request.requester_id, profile];
        }),
      );
      if (!cancelled) {
        setProfilesById(Object.fromEntries(entries));
      }
    }
    if (incomingRequests.length > 0) {
      loadProfiles();
    }
    return () => {
      cancelled = true;
    };
  }, [incomingRequests]);

  if (incomingRequests.length === 0) {
    return null;
  }

  return (
    <div className="profile-share-section detail-form-label">
      <span>Friend Requests</span>
      <div className="profile-share-list">
        {incomingRequests.map((request) => {
          const requesterProfile = profilesById[request.requester_id];
          const label = requesterProfile?.name || (requesterProfile?.handle ? `@${requesterProfile.handle}` : 'Someone');
          return (
            <div className="profile-share-row" key={request.id}>
              <span>{label}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  type="button"
                  className="secondary-button"
                  onClick={() => onRespond(request.id, false)}
                  whileHover={{ y: -1, transition: spring.hover }}
                  whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
                >
                  Decline
                </motion.button>
                <motion.button
                  type="button"
                  className="primary-button"
                  onClick={() => onRespond(request.id, true)}
                  whileHover={{ y: -1, transition: spring.hover }}
                  whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
                >
                  Accept
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FriendRequestsPanel;
