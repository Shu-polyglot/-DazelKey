import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import PhotoCropper from '../shared/PhotoCropper';
import { transitions, spring } from '../../styles/motion';

const containerVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

function PhotoStep({ initialValue = null, onSubmit }) {
  const [photo, setPhoto] = useState(initialValue);
  const [cropSource, setCropSource] = useState(null);
  const inputRef = useRef(null);

  function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    setCropSource(URL.createObjectURL(file));
  }

  function handleCropConfirm(dataUrl) {
    setPhoto(dataUrl);
    URL.revokeObjectURL(cropSource);
    setCropSource(null);
  }

  function handleCropCancel() {
    URL.revokeObjectURL(cropSource);
    setCropSource(null);
  }

  return (
    <motion.div
      className="opening-content"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <p className="opening-eyebrow">Life OS wants to know</p>
      <h2 className="opening-question">Add a photo of yourself</h2>

      <button
        type="button"
        className="photo-dropzone"
        onClick={() => inputRef.current?.click()}
        style={photo ? { backgroundImage: `url(${photo})` } : undefined}
        aria-label={photo ? 'Change photo' : 'Upload a photo'}
      >
        {!photo && <span className="photo-dropzone-label">+</span>}
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="photo-input" onChange={handleFile} />

      <motion.button
        type="button"
        className="opening-cta"
        onClick={() => onSubmit(photo)}
        whileHover={{ y: -2, transition: spring.hover }}
        whileTap={{ y: 1, scale: 0.96, transition: spring.press }}
      >
        {photo ? 'Continue' : 'Skip for now'}
      </motion.button>

      {cropSource && <PhotoCropper imageSrc={cropSource} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />}
    </motion.div>
  );
}

export default PhotoStep;
