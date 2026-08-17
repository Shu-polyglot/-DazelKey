import { useState } from 'react';
import { motion } from 'motion/react';
import { transitions, spring } from '../../styles/motion';

const MIN_AGE = 1;
const MAX_AGE = 119;

const containerVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: transitions.emphasis },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: transitions.exit },
};

function AgeStep({ onSubmit }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function parsedAge() {
    const age = Number(value);
    return value.trim() !== '' && Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE ? age : null;
  }

  function submit() {
    const age = parsedAge();
    if (age === null) {
      setError(true);
      return;
    }
    onSubmit(age);
  }

  return (
    <motion.div
      className="opening-content age-step"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
    >
      <p className="opening-eyebrow">Life OS wants to know</p>
      <h2 className="age-question">How old are you?</h2>

      <div className={`age-input-wrap${error ? ' has-error' : ''}`}>
        <input
          type="number"
          inputMode="numeric"
          className="age-input"
          value={value}
          autoFocus
          placeholder="—"
          aria-label="Your age"
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
          className="age-continue"
          aria-label="Continue"
          onClick={submit}
          whileHover={{ x: 3, transition: spring.hover }}
          whileTap={{ x: -1, scale: 0.94, transition: spring.press }}
        >
          →
        </motion.button>
      </div>

      {error && (
        <p className="age-error">
          Enter an age between {MIN_AGE} and {MAX_AGE}.
        </p>
      )}
    </motion.div>
  );
}

export default AgeStep;
