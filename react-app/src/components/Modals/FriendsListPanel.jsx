import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { formatMonth } from '../../lib/dates';
import { spring } from '../../styles/motion';

// Inline list inside ProfilePanel of accepted friends (with a Remove
// action) plus any outgoing requests still awaiting the other side's
// approval (with a Cancel action) -- see FriendRequestsPanel for the
// matching incoming-side list. A friendship row only has both users'
// ids, so this looks up each "other side" profile the same way that
// panel does, to show a photo/name/handle/role instead of a bare name,
// plus how long the friendship has actually existed (or that a request
// is still waiting) rather than an undifferentiated flat list.
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

  function renderRow(row, actionLabel, statusText) {
    const id = otherUserId(row);
    const profile = profilesById[id];
    const name = profile?.name || 'Someone';
    const detail = profile?.role || profile?.bio;
    const handleAndStatus = [profile?.handle && `@${profile.handle}`, statusText].filter(Boolean).join(' · ');
    return (
      <div className="profile-share-row friend-row" key={row.id}>
        <span
          className="friend-row-avatar"
          style={{ backgroundImage: profile?.photo ? `url(${profile.photo})` : 'none' }}
        />
        <div className="friend-row-meta">
          <span className="friend-row-name">{name}</span>
          {handleAndStatus && <span className="friend-row-handle">{handleAndStatus}</span>}
          {detail && <span className="friend-row-detail">{detail}</span>}
        </div>
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
        {friendships.map((row) => renderRow(row, 'Remove', `Friends since ${formatMonth(new Date(row.created_at))}`))}
        {outgoingRequests.map((row) => renderRow(row, 'Cancel', 'Request sent — waiting for them to accept'))}
      </div>
    </div>
  );
}

export default FriendsListPanel;
