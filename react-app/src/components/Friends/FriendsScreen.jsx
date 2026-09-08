import { motion } from 'motion/react';
import { useFriends } from '../../hooks/useFriends';
import { useBucketInvites } from '../../hooks/useBucketInvites';
import FriendRequestsPanel from '../Modals/FriendRequestsPanel';
import FriendsListPanel from '../Modals/FriendsListPanel';
import BucketInvitesPanel from '../Modals/BucketInvitesPanel';
import { easing } from '../../styles/motion';
import '../shared/PreviewProfile.css';
import '../Modals/ProfilePanel.css';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easing.standard } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: easing.exit } },
};

/*
  A dedicated home for friend management, opened from the "Friends"
  button in ProfilePage's header actions. This used to be a section
  buried at the bottom of ProfilePanel's edit-profile form (see
  FriendRequestsPanel/FriendsListPanel's own header comments) -- same
  hook, same two child components, same data, just surfaced somewhere a
  person would actually think to look for "who are my friends" instead
  of behind Edit Profile. Reuses PreviewProfile's plain-scrollable-page
  shell (not the cinematic TransitionRitual one) since this is a
  functional list, not a moment to dwell on.

  Inviting someone new stays a distinct action, still triggered from
  ProfilePage's own share menu (Share Invite Link) -- this screen is
  about managing people already in some state of that relationship
  (pending, incoming, or already friends), not the invite itself.

  Bucket invites (see useBucketInvites/BucketInviteModal) live here too
  -- they're a friend-graph object, same shape as a friend request, just
  scoped to one shared Bucket instead of the relationship itself.
  Accepting one needs `onAddBucket` (passed down from App.jsx via
  ProfilePage) since creating the accepted Bucket is outside what
  useBucketInvites itself can reach.
*/
function FriendsScreen({ onClose, onAddBucket }) {
  const { friendships, incomingRequests, outgoingRequests, respondToRequest, removeFriendship, currentUserId } =
    useFriends();
  const { incomingInvites, respondToInvite } = useBucketInvites();

  const hasNothingYet =
    friendships.length === 0 && incomingRequests.length === 0 && outgoingRequests.length === 0 && incomingInvites.length === 0;

  async function handleAcceptInvite(invite) {
    const { error } = await respondToInvite(invite.id, true);
    if (!error) {
      onAddBucket({
        title: invite.title,
        place: invite.place,
        when: invite.bucket_when,
        message: invite.message,
        mode: 'together',
      });
    }
  }

  return (
    <motion.div className="preview-profile" initial="hidden" animate="visible" exit="exit" variants={overlayVariants}>
      <div className="preview-profile-topbar">
        <span className="preview-profile-badge">Friends</span>
        <button type="button" className="secondary-button" onClick={onClose}>
          Close
        </button>
      </div>

      {hasNothingYet && (
        <p className="preview-profile-empty">
          No friends yet — share your invite link from Profile to add one.
        </p>
      )}

      <BucketInvitesPanel
        incomingInvites={incomingInvites}
        onAccept={handleAcceptInvite}
        onDecline={(id) => respondToInvite(id, false)}
      />

      <FriendRequestsPanel incomingRequests={incomingRequests} onRespond={respondToRequest} />

      <FriendsListPanel
        friendships={friendships}
        outgoingRequests={outgoingRequests}
        currentUserId={currentUserId}
        onRemove={removeFriendship}
      />
    </motion.div>
  );
}

export default FriendsScreen;
