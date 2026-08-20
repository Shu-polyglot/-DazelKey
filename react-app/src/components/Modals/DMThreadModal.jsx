import { useState } from 'react';
import { motion } from 'motion/react';
import Modal from './Modal';
import { spring } from '../../styles/motion';
import './Modals.css';
import './DMThreadModal.css';

/*
  Explore's "Message" button needs somewhere to land, not a working inbox
  -- there's no thread storage or delivery anywhere in this app yet, so
  this only echoes what you type back into the thread, locally, for this
  one open. Wiring it to a real conversation (storage, the other side
  actually receiving it) is separate work.
*/
function DMThreadModal({ recipient, onClose }) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);

  function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      return;
    }
    setMessages((prev) => [...prev, { id: `${Date.now()}`, text }]);
    setDraft('');
  }

  return (
    <Modal onClose={onClose} className="dm-thread-modal">
      <div className="modal-header detail-header">
        <div className="dm-thread-recipient">
          <span className="dm-thread-avatar" style={{ backgroundImage: `url(${recipient.avatar})` }} />
          <div>
            <h3>{recipient.name}</h3>
            <p className="dm-thread-handle">{recipient.handle}</p>
          </div>
        </div>
        <motion.button
          type="button"
          className="icon-button"
          aria-label="Close conversation"
          onClick={onClose}
          whileHover={{ rotate: 90, transition: spring.hover }}
          whileTap={{ scale: 0.88, transition: spring.press }}
        >
          ×
        </motion.button>
      </div>

      <div className="dm-thread-body">
        {messages.length === 0 ? (
          <p className="dm-thread-empty">Say something inspired by their achievement.</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="dm-thread-message">
              {message.text}
            </div>
          ))
        )}
      </div>

      <form className="dm-thread-composer" onSubmit={handleSend}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Message ${recipient.name}`}
          aria-label={`Message ${recipient.name}`}
        />
        <button type="submit" className="primary-button" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </Modal>
  );
}

export default DMThreadModal;
