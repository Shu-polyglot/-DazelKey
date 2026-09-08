import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { lookupPublicProfileByUserId } from '../../hooks/usePublicProfile';
import { getWhenLabel } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';
import '../BucketList/BucketInviteModal.css';

// Mirrors FriendRequestsPanel exactly (same row/action shape), but for
// incoming Bucket invites (see useBucketInvites/bucket_invites.sql) --
// a friend inviting you into one of their own Bucket List intentions,
// not a friendship request. Each invite only carries the sender's
// user_id, so this looks their public profile up the same way that
// panel does.
function BucketInvitesPanel({ incomingInvites, onAccept, onDecline }) {
  const [profilesById, setProfilesById] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function loadProfiles() {
      const entries = await Promise.all(
        incomingInvites.map(async (invite) => [invite.from_user_id, await lookupPublicProfileByUserId(invite.from_user_id)]),
      );
      if (!cancelled) {
        setProfilesById(Object.fromEntries(entries));
      }
    }
    if (incomingInvites.length > 0) {
      loadProfiles();
    }
    return () => {
      cancelled = true;
    };
  }, [incomingInvites]);

  if (incomingInvites.length === 0) {
    return null;
  }

  return (
    <div className="profile-share-section detail-form-label">
      <span>Bucket Invites</span>
      <div className="profile-share-list">
        {incomingInvites.map((invite) => {
          const senderProfile = profilesById[invite.from_user_id];
          const senderName = senderProfile?.name || 'Someone';
          // A Recommend-generated plan (see RecommendPlanFlow) makes a
          // much more concrete first impression than the bare place/
          // when this row otherwise falls back to -- a real date and
          // destination reads as "here's an actual plan", not just a
          // request.
          const planDestination = invite.plan?.plan?.destination;
          const planDate = invite.plan?.plan?.date;
          const hasPlan = Boolean(planDestination || planDate);
          const detail = hasPlan
            ? [planDestination, planDate && formatDate(planDate)].filter(Boolean).join(' · ')
            : [invite.place, getWhenLabel(invite.bucket_when)].filter(Boolean).join(' · ');
          return (
            <div className="profile-share-row friend-row" key={invite.id}>
              <span
                className="friend-row-avatar"
                style={{ backgroundImage: senderProfile?.photo ? `url(${senderProfile.photo})` : 'none' }}
              />
              <div className="friend-row-meta">
                <span className="friend-row-name">
                  {invite.title}
                  {hasPlan && <span className="invite-modal-plan-badge">✨ Plan</span>}
                </span>
                <span className="friend-row-handle">{senderName} invited you</span>
                {detail && <span className="friend-row-detail">{detail}</span>}
              </div>
              <div className="friend-row-actions">
                <motion.button
                  type="button"
                  className="secondary-button"
                  onClick={() => onDecline(invite.id)}
                  whileHover={{ y: -1, transition: spring.hover }}
                  whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
                >
                  Decline
                </motion.button>
                <motion.button
                  type="button"
                  className="primary-button"
                  onClick={() => onAccept(invite)}
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

export default BucketInvitesPanel;
