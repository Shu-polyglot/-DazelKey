import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import Modal from './Modal';
import { spring } from '../../styles/motion';
import './Modals.css';
import './ProfilePanel.css';

const MIN_AGE = 1;
const MAX_AGE = 119;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ProfilePanel({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age ?? '');
  const [photo, setPhoto] = useState(profile?.photo || null);
  const fileInputRef = useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setPhoto(dataUrl);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedAge = Number(age);
    const validAge = Number.isInteger(parsedAge) && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE ? parsedAge : null;

    onSave({
      name: trimmedName,
      age: validAge,
      photo,
    });
  }

  return (
    <Modal onClose={onClose}>
      <div className="modal-header">
        <h3>Your profile</h3>
      </div>

      <form className="detail-form" onSubmit={handleSubmit}>
        <button
          type="button"
          className="profile-photo-button"
          onClick={() => fileInputRef.current?.click()}
          style={photo ? { backgroundImage: `url(${photo})` } : undefined}
          aria-label={photo ? 'Change photo' : 'Upload a photo'}
        >
          {!photo && <span>+</span>}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="photo-input" onChange={handleFile} />

        <label className="detail-form-label">
          <span>Name</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>

        <label className="detail-form-label">
          <span>Age</span>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            placeholder="Your age"
            min={MIN_AGE}
            max={MAX_AGE}
          />
        </label>

        <div className="modal-actions">
          <motion.button
            type="button"
            className="secondary-button"
            onClick={onClose}
            whileHover={{ y: -1, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="primary-button"
            whileHover={{ y: -2, transition: spring.hover }}
            whileTap={{ y: 1, scale: 0.95, transition: spring.commit }}
          >
            Save
          </motion.button>
        </div>
      </form>
    </Modal>
  );
}

export default ProfilePanel;
