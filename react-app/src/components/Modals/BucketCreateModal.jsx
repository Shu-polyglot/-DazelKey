import Modal from './Modal';
import BucketStepEditor from './BucketStepEditor';
import './Modals.css';
import './BucketStepEditor.css';

/**
 * Creating a Bucket uses the same one-question-at-a-time surface as
 * editing one -- there's no separate "quick add" form. Passing no
 * `bucket` puts BucketStepEditor in create mode.
 */
function BucketCreateModal({ onClose, onAdd }) {
  return (
    <Modal onClose={onClose} className="step-editor-modal">
      <BucketStepEditor
        onCancel={onClose}
        onSave={(input) => {
          onAdd(input);
          onClose();
        }}
      />
    </Modal>
  );
}

export default BucketCreateModal;
