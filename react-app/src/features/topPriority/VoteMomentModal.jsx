import { motion } from 'motion/react';
import Modal from '../../components/Modals/Modal';
import { formatDate } from '../../lib/dates';
import { spring } from '../../styles/motion';
import '../../components/Modals/Modals.css';
import './topPriority.css';

/*
  What a grid cell opens into when tapped, but only for a vote that
  actually has a photo and/or comment attached (see PriorityVoteGrid's
  onSelectVote) -- a plain vote day has nothing to enlarge into. Modal-
  scale, not MilestoneRitual's full-screen treatment: this is a quiet
  look-back, not a moment being celebrated.
*/
function VoteMomentModal({ vote, onClose }) {
  return (
    <Modal onClose={onClose} className="vote-moment-modal">
      <div className="modal-header detail-header">
        <div>
          <p className="vote-moment-modal-date">{formatDate(vote.date)}</p>
          {vote.isMilestone && <p className="vote-moment-modal-milestone">★ {vote.milestoneLabel || 'Milestone'}</p>}
        </div>
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

      {vote.photoUrl && <img src={vote.photoUrl} alt="" className="vote-moment-modal-photo" />}
      {vote.comment && <p className="vote-moment-modal-comment">{vote.comment}</p>}
    </Modal>
  );
}

export default VoteMomentModal;
