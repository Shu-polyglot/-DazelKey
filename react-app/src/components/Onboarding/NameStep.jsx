import { useState } from 'react';
import { motion } from 'motion/react';
import { transitions, spring } from '../../styles/motion';

const MAX_NAME_LENGTH = 60;

const containerVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

function NameStep({ initialValue = '', onSubmit }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    onSubmit(trimmed);
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
      <h2 className="opening-question">What’s your name?</h2>

      <div className={`opening-input-row${error ? ' has-error' : ''}`}>
        <input
          type="text"
          className="name-input"
          value={value}
          autoFocus
          placeholder="Your name"
          maxLength={MAX_NAME_LENGTH}
          aria-label="Your name"
          onChange={(event) => {
            setError(false);
            setValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit();
            }
          }}
        />

        <motion.button
          type="button"
          className="opening-continue"
          aria-label="Continue"
          onClick={submit}
          whileHover={{ x: 3, transition: spring.hover }}
          whileTap={{ x: -1, scale: 0.94, transition: spring.press }}
        >
          →
        </motion.button>
      </div>

      {error && <p className="opening-error">Tell us what to call you.</p>}
    </motion.div>
  );
}

export default NameStep;
