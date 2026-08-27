import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { spring } from '../../styles/motion';

// Inline list inside ProfilePanel of accepted friends (with a Remove
// action) plus any outgoing requests still awaiting the other side's
// approval (with a Cancel action) -- see FriendRequestsPanel for the
// matching incoming-side list. A friendship row only has both users'
// ids, so this looks up each "other side" profile the same way that
// panel does, to show a name/handle instead of a bare id.
function FriendsListPanel({ friendships, outgoingRequests, currentUserId, onRemove }) {
  const [profilesById, setProfilesById] = useState({});

  const otherUserId = (row) => (row.requester_id === currentUserId ? row.addressee_id : row.requester_id);
  const allRows = [...friendships, ...outgoingRequests];

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      const ids = [...new Set(allRows.map(otherUserId))];
      const entries = await Promise.all(
        ids.map(async (id) => [id, await lookupPublicProfileByUserId(id)]),
      );
      if (!cancelled) {
        setProfilesById(Object.fromEntries(entries));
      }
    }
    if (allRows.length > 0) {
      loadProfiles();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendships, outgoingRequests, currentUserId]);

  if (friendships.length === 0 && outgoingRequests.length === 0) {
    return null;
  }

  function renderRow(row, actionLabel) {
    const id = otherUserId(row);
    const profile = profilesById[id];
    const label = profile?.name || (profile?.handle ? `@${profile.handle}` : 'Someone');
    return (
      <div className="profile-share-row" key={row.id}>
        <span>{label}</span>
        <motion.button
          type="button"
          className="secondary-button"
          onClick={() => onRemove(row.id)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
        >
          {actionLabel}
        </motion.button>
      </div>
    );
  }

  return (
    <div className="profile-share-section detail-form-label">
      <span>Friends</span>
      <div className="profile-share-list">
        {friendships.map((row) => renderRow(row, 'Remove'))}
        {outgoingRequests.map((row) => renderRow(row, 'Cancel'))}
      </div>
    </div>
  );
}

export default FriendsListPanel;
