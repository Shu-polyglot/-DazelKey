import Modal from '../../components/Modals/Modal';

/*
  What a goal card's long-press opens -- a plain action sheet, reusing
  the same Modal backdrop every other overlay in this module already
  uses rather than a bespoke popover system, just with its own compact
  content (see .goal-card-menu in topPriority.css) instead of a form.
*/
function GoalCardMenu({ onEdit, onDelete, onClose }) {
  return (
    <Modal onClose={onClose} className="goal-card-menu">
      <button type="button" className="goal-card-menu-item" onClick={onEdit}>
        Edit
      </button>
      <button type="button" className="goal-card-menu-item is-destructive" onClick={onDelete}>
        Delete
      </button>
      <button type="button" className="goal-card-menu-item is-cancel" onClick={onClose}>
        Cancel
      </button>
    </Modal>
  );
}

export default GoalCardMenu;
