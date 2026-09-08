import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { useFriends } from '../../hooks/useFriends';
import { useBucketInvites } from '../../hooks/useBucketInvites';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import '../Modals/ProfilePanel.css';
import './BucketInviteModal.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

// The one place "誘う" happens -- opened from ExpandedBucketCard, picks
// one accepted friend at a time to send this Bucket to (see
// useBucketInvites/bucket_invites.sql for why this is a structured
// invite object, not a DM). Every friend row shows the invite's current
// state for THIS Bucket specifically -- a friend can be mid-invite on
// one Bucket and untouched on another.
function BucketInviteModal({ bucket, plan = null, onClose }) {
  const { friendships, currentUserId } = useFriends();
  const { outgoingForBucket, sendInvite } = useBucketInvites();
  const [profilesById, setProfilesById] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const otherUserId = (row) => (row.requester_id === currentUserId ? row.addressee_id : row.requester_id);
  const statusByFriendId = Object.fromEntries(outgoingForBucket(bucket.id).map((invite) => [invite.to_user_id, invite.status]));

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      const entries = await Promise.all(
        friendships.map(async (row) => {
          const id = otherUserId(row);
          return [id, await lookupPublicProfileByUserId(id)];
        }),
      );
      if (!cancelled) {
        setProfilesById(Object.fromEntries(entries));
      }
    }
    if (friendships.length > 0) {
      loadProfiles();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendships, currentUserId]);

  async function handleInvite(friendId) {
    setSendingId(friendId);
    await sendInvite(friendId, bucket, plan);
    setSendingId(null);
  }

  return createPortal(
    <Modal onClose={onClose} className="step-editor-modal invite-modal">
      <div className="step-editor">
        <div className="step-editor-topbar">
          <p className="step-editor-eyebrow">
            Invite to &ldquo;{bucket.title}&rdquo;
            {plan?.plan && <span className="invite-modal-plan-badge">Plan attached</span>}
          </p>
          <motion.button
            type="button"
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
            whileHover={{ rotate: 90, transition: spring.hover }}
            whileTap={{ scale: 0.88, transition: spring.press }}
          >
            ×
          </motion.button>
        </div>

        {friendships.length === 0 ? (
          <p className="invite-modal-empty">Add a friend from your Profile first, then invite them here.</p>
        ) : (
          <div className="profile-share-list">
            {friendships.map((row) => {
              const id = otherUserId(row);
              const profile = profilesById[id];
              const name = profile?.name || 'Someone';
              const status = statusByFriendId[id];
              return (
                <div className="profile-share-row friend-row" key={row.id}>
                  <span
                    className="friend-row-avatar"
                    style={{ backgroundImage: profile?.photo ? `url(${profile.photo})` : 'none' }}
                  />
                  <div className="friend-row-meta">
                    <span className="friend-row-name">{name}</span>
                    {profile?.handle && <span className="friend-row-handle">@{profile.handle}</span>}
                  </div>
                  <div className="friend-row-actions">
                    {status === 'accepted' ? (
                      <span className="friend-row-detail">🎉 Joined</span>
                    ) : (
                      <motion.button
                        type="button"
                        className="secondary-button"
                        disabled={status === 'pending' || sendingId === id}
                        onClick={() => handleInvite(id)}
                        {...tapProps}
                      >
                        {status === 'pending' ? 'Invited' : 'Invite'}
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>,
    document.body,
  );
}

export default BucketInviteModal;
