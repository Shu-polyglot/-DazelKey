import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Modal from '../Modals/Modal';
import { supabase } from '../../lib/supabase';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './Strategy.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  A three-step exchange with Gemini (see supabase/functions/plan-goal-
  chat) about one specific Realize goal, ending in a structured plan the
  person can drop straight into AddGoalFlow's amount/checklist steps.
  This component only ever talks to that one Edge Function -- it has no
  idea Gemini is what's on the other end, and never sees an API key.

  1. On open, it reads the goal title and asks the function for a
     handful of clarifying questions (phase: 'questions') -- the
     specifics that would most change the estimate, e.g. destination or
     quality tier -- rather than starting from a blank chat.
  2. The person answers as many as they want in a plain form; anything
     left blank just tells Gemini to use its best judgment.
  3. Submitting asks for the actual plan (phase: 'plan'), passing the
     questions and answers back so Gemini can ground its estimate in
     them. The function returns 2-3 alternative plans rather than one
     fixed number -- the person picks among them (defaulting to
     whichever one Gemini flagged `isRecommended`) before accepting or
     going back to revise their answers.
*/
function GoalPlanChat({ goalTitle, onApply, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  async function callFunction(payload) {
    const { data, error: invokeError } = await supabase.functions.invoke('plan-goal-chat', {
      body: { goalTitle, ...payload },
    });
    if (invokeError) {
      throw new Error(invokeError.message || 'Something went wrong.');
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    return data;
  }

  async function loadQuestions() {
    setError('');
    setIsSending(true);
    try {
      const data = await callFunction({ phase: 'questions' });
      const nextQuestions = data.questions || [];
      setQuestions(nextQuestions);
      setAnswers(nextQuestions.map(() => ''));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    loadQuestions();
    // goalTitle is fixed for the life of this modal (AddGoalFlow mounts
    // a fresh one per bucket), so this only ever needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswerChange(index, value) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
  }

  async function handleGetPlan() {
    if (isSending) {
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const qa = questions.map((question, index) => ({ question: question.question, answer: answers[index] }));
      const data = await callFunction({ phase: 'plan', answers: qa });
      const nextPlans = data.plans;
      // Gemini is asked to flag exactly one option, but structured output
      // only guarantees the type is a boolean, not that it followed that
      // rule -- fall back to the first option if none (or more than one)
      // came back marked.
      const recommendedIndex = nextPlans.findIndex((candidate) => candidate.isRecommended);
      setSelectedPlanIndex(recommendedIndex >= 0 ? recommendedIndex : 0);
      setPlans(nextPlans);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  function handleApply() {
    onApply(plans[selectedPlanIndex]);
  }

  const hasQuestions = questions.length > 0;
  const selectedPlan = plans?.[selectedPlanIndex];

  return (
    <Modal onClose={onClose} className="step-editor-modal goal-plan-chat-modal">
      <div className="step-editor">
        <div className="step-editor-topbar">
          <p className="step-editor-eyebrow">🪄 Plan &ldquo;{goalTitle}&rdquo; with AI</p>
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

        {plans ? (
          <div className="goal-plan-chat-summary">
            {plans.length > 1 && (
              <div className="goal-plan-chat-plan-options">
                {plans.map((candidate, index) => (
                  <motion.button
                    type="button"
                    key={candidate.label}
                    className={`goal-plan-chat-plan-option ${index === selectedPlanIndex ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlanIndex(index)}
                    {...tapProps}
                  >
                    {candidate.isRecommended && <span className="goal-plan-chat-plan-badge">Recommended</span>}
                    <span className="goal-plan-chat-plan-option-label">{candidate.label}</span>
                    <span className="goal-plan-chat-plan-option-amount">¥{Number(candidate.goalAmount).toLocaleString('en-US')}</span>
                  </motion.button>
                ))}
              </div>
            )}
            <p className="goal-plan-chat-summary-text">{selectedPlan.summary}</p>
            <p className="goal-plan-chat-summary-amount">Estimated total: ¥{Number(selectedPlan.goalAmount).toLocaleString('en-US')}</p>
            {selectedPlan.checklist.length > 0 && (
              <ul className="goal-plan-chat-summary-list">
                {selectedPlan.checklist.map((item) => (
                  <li key={item.label}>
                    {item.isMilestone ? '★ ' : ''}
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : hasQuestions ? (
          <div className="goal-plan-chat-questions">
            <p className="goal-plan-chat-hint">Answer as many as you'd like — skip anything you're not sure about.</p>
            {questions.map((question, index) => (
              <div className="goal-plan-chat-question" key={question.question}>
                <p className="goal-plan-chat-question-label">{question.question}</p>
                <input
                  type="text"
                  className="goal-plan-chat-question-input"
                  value={answers[index] || ''}
                  onChange={(event) => handleAnswerChange(index, event.target.value)}
                  placeholder={question.placeholder}
                  disabled={isSending}
                  autoFocus={index === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="goal-plan-chat-thread">
            <p className="goal-plan-chat-hint">{isSending ? 'Thinking of a few questions…' : 'Something went wrong.'}</p>
          </div>
        )}

        {error && <p className="goal-plan-chat-error">{error}</p>}

        <div className="step-editor-footer">
          {plans ? (
            <>
              <motion.button type="button" className="secondary-button" onClick={() => setPlans(null)} {...tapProps}>
                Answer differently
              </motion.button>
              <motion.button type="button" className="primary-button" onClick={handleApply} {...tapProps}>
                Use this plan
              </motion.button>
            </>
          ) : hasQuestions ? (
            <motion.button type="button" className="primary-button" onClick={handleGetPlan} disabled={isSending} {...tapProps}>
              {isSending ? 'Working on it…' : 'Get my plan'}
            </motion.button>
          ) : (
            !isSending && (
              <motion.button type="button" className="primary-button" onClick={loadQuestions} {...tapProps}>
                Try again
              </motion.button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}

export default GoalPlanChat;
