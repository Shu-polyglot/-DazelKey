import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { spring } from '../../styles/motion';

// Small inline list inside ProfilePanel showing incoming friend requests
// (see useFriends' incomingRequests) with Accept/Decline actions. Each
// request only has the requester's user_id, so this looks up their
// public profile -- photo, name, handle, and role/bio if they set one
// -- to show something a person can actually recognize, not just a name.
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
          const name = requesterProfile?.name || 'Someone';
          const detail = requesterProfile?.role || requesterProfile?.bio;
          return (
            <div className="profile-share-row friend-row" key={request.id}>
              <span
                className="friend-row-avatar"
                style={{ backgroundImage: requesterProfile?.photo ? `url(${requesterProfile.photo})` : 'none' }}
              />
              <div className="friend-row-meta">
                <span className="friend-row-name">{name}</span>
                {requesterProfile?.handle && <span className="friend-row-handle">@{requesterProfile.handle}</span>}
                {detail && <span className="friend-row-detail">{detail}</span>}
              </div>
              <div className="friend-row-actions">
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
