import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import TraitPicker from './TraitPicker';
import { QUIZ_QUESTIONS, QUIZ_SCALE, TOP_DIMENSIONS_COUNT } from '../../data/traitQuiz';
import { scoreQuiz, getTopDimensions } from '../../lib/traitQuiz';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  MBTI-flavored, but the score never becomes a fixed type -- it only
  proposes which dimension(s) to try first. Every trait chip in the
  results view still goes through the exact same activation path as
  Strategy's own "+ Add a Trait" browser, so nothing about how a trait
  becomes a Become Bucket is quiz-specific.
*/
function TraitQuiz({ activeTraitNames, onActivateTrait, onClose }) {
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState('questions');

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const topDimensions = useMemo(() => {
    if (view !== 'results') {
      return [];
    }
    return getTopDimensions(scoreQuiz(answers), TOP_DIMENSIONS_COUNT);
  }, [view, answers]);

  function handleAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function handleSeeResults() {
    if (allAnswered) {
      setView('results');
    }
  }

  function handleRetake() {
    setAnswers({});
    setView('questions');
  }

  return (
    <Modal onClose={onClose} className="detail-modal trait-quiz-modal">
      <div className="modal-header detail-header">
        <h3>{view === 'questions' ? 'The Trait Quiz' : 'Your natural strengths'}</h3>
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

      {view === 'questions' ? (
        <>
          <p className="trait-quiz-intro">
            18 quick statements, rated 1 to 5. This only suggests where to start -- nothing here fills in the radar
            chart by itself; that only grows from actually voting.
          </p>

          <div className="trait-quiz-questions">
            {QUIZ_QUESTIONS.map((question, index) => (
              <div className="trait-quiz-question" key={index}>
                <p className="trait-quiz-question-text">{question.text}</p>
                <div className="trait-quiz-scale">
                  {QUIZ_SCALE.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`trait-quiz-scale-button${answers[index] === option.value ? ' is-active' : ''}`}
                      aria-label={option.label}
                      onClick={() => handleAnswer(index, option.value)}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <motion.button
              type="button"
              className="primary-button"
              disabled={!allAnswered}
              onClick={handleSeeResults}
              whileHover={allAnswered ? { y: -1, transition: spring.hover } : undefined}
              whileTap={allAnswered ? { y: 1, scale: 0.97, transition: spring.press } : undefined}
            >
              {allAnswered ? 'See my results' : `${answeredCount} of ${QUIZ_QUESTIONS.length} answered`}
            </motion.button>
          </div>
        </>
      ) : (
        <>
          <p className="trait-quiz-intro">
            {topDimensions.join(' and ')} came out strongest. Tap any trait below to start voting for it -- pick as
            many as you like, or none at all.
          </p>

          <TraitPicker dimensions={topDimensions} activeTraitNames={activeTraitNames} onActivate={onActivateTrait} />

          <div className="modal-actions">
            <motion.button
              type="button"
              className="secondary-button"
              onClick={handleRetake}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
            >
              Retake the quiz
            </motion.button>
            <motion.button
              type="button"
              className="primary-button"
              onClick={onClose}
              whileHover={{ y: -1, transition: spring.hover }}
              whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
            >
              Done
            </motion.button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default TraitQuiz;
