import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import RadarChart from './RadarChart';
import { TRAITS_BY_DIMENSION } from '../../data/traits';
import { QUIZ_QUESTIONS, QUIZ_SCALE, TOP_DIMENSIONS_COUNT } from '../../data/traitQuiz';
import { scoreQuiz, getTopDimensions } from '../../lib/traitQuiz';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './Strategy.css';

/*
  MBTI-flavored, but the score never becomes a fixed type, and it never
  touches Strategy at all anymore -- this is purely a periodic
  self-check-in (see ProfilePanel), fully decoupled from Become's daily
  votes. `onComplete(scores)` hands the raw per-dimension scores back up
  so the caller can persist them to the profile; this component holds no
  state beyond the current attempt.
*/
function TraitQuiz({ onComplete, onClose }) {
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState('questions');

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === QUIZ_QUESTIONS.length;

  const scores = useMemo(() => (view === 'results' ? scoreQuiz(answers) : null), [view, answers]);
  const topDimensions = useMemo(() => (scores ? getTopDimensions(scores, TOP_DIMENSIONS_COUNT) : []), [scores]);

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

  function handleDone() {
    if (scores) {
      onComplete(scores);
    }
    onClose();
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
            18 quick statements, rated 1 to 5. This is just for you -- a quiet check-in on who you are right now,
            separate from anything you're actively working toward.
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
          <p className="trait-quiz-intro">{topDimensions.join(' and ')} came out strongest right now.</p>

          <RadarChart scores={scores} />

          <div className="trait-picker">
            {topDimensions.map((dimension) => (
              <div className="trait-picker-group" key={dimension}>
                <span className="trait-picker-dimension">{dimension}</span>
                <div className="trait-chip-row">
                  {TRAITS_BY_DIMENSION[dimension].map((trait) => (
                    <span key={trait} className="trait-chip is-active">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

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
              onClick={handleDone}
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
