import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Modal from '../Modals/Modal';
import { supabase } from '../../lib/supabase';
import { formatPlanTime } from '../../lib/buckets';
import { spring } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketStepEditor.css';
import './Execute.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  Execute turns one Bucket into a real, dated plan -- distinct from
  Realize (Strategy/GoalPlanChat), which estimates a money goal for a
  Doing Bucket and has no idea real places or dates exist. This talks to
  its own Edge Function (supabase/functions/execute-plan) in three
  rounds:
    1. 'questions' -- a few clarifying questions given just the title
       (skipped straight to round 2 if none are needed).
    2. 'plan' -- grounded web research + a structured plan. Can come
       back needing more input instead (status: 'needs_input'), which
       loops back to a questions form rather than failing outright.
    3. Applying the result writes its schedule into the Bucket's own
       `planItems` (the same Itinerary ExpandedBucketCard already shows)
       and the full result into `executePlan` for next time this opens.
  Always portalled to document.body itself (see CLAUDE.md) since its
  caller, ExpandedBucketCard, lives inside the animated page-shell.
*/
function ExecutePlanFlow({ bucket, onApply, onClose }) {
  const [phase, setPhase] = useState('loading');
  const [loadingLabel, setLoadingLabel] = useState('Thinking about what to ask…');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(bucket.executePlan || null);
  const [pendingQa, setPendingQa] = useState(null);

  async function callFunction(payload) {
    const { data, error: invokeError } = await supabase.functions.invoke('execute-plan', {
      body: {
        bucketTitle: bucket.title,
        place: bucket.place,
        mode: bucket.mode,
        when: bucket.when,
        ...payload,
      },
    });
    if (invokeError) {
      throw new Error(invokeError.message || 'Something went wrong.');
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    return data;
  }

  async function generatePlan(qa) {
    setError('');
    setPendingQa(qa);
    setPhase('loading');
    setLoadingLabel('Searching the web for real options…');
    try {
      const data = await callFunction({ phase: 'plan', answers: qa });
      if (data.status === 'needs_input') {
        setQuestions(data.questions.map((question) => (typeof question === 'string' ? { question, placeholder: '' } : question)));
        setAnswers(data.questions.map(() => ''));
        setIsFollowUp(true);
        setPhase('questions');
        return;
      }
      setResult(data);
      setPhase('plan');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  async function loadQuestions() {
    setError('');
    setResult(null);
    setIsFollowUp(false);
    setPhase('loading');
    setLoadingLabel('Thinking about what to ask…');
    try {
      const data = await callFunction({ phase: 'questions' });
      const nextQuestions = data.questions || [];
      if (nextQuestions.length === 0) {
        await generatePlan([]);
        return;
      }
      setQuestions(nextQuestions);
      setAnswers(nextQuestions.map(() => ''));
      setPhase('questions');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  useEffect(() => {
    if (!bucket.executePlan) {
      loadQuestions();
    }
    // bucket is fixed for the life of this modal (ExpandedBucketCard
    // mounts a fresh one per bucket), so this only ever needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAnswerChange(index, value) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
  }

  function handleSubmitAnswers() {
    const qa = questions.map((question, index) => ({ question: question.question, answer: answers[index] }));
    generatePlan(qa);
  }

  function handleRetry() {
    if (pendingQa) {
      generatePlan(pendingQa);
    } else {
      loadQuestions();
    }
  }

  function handleApply() {
    onApply(result);
    onClose();
  }

  return createPortal(
    <Modal onClose={onClose} className="step-editor-modal execute-plan-modal">
      <div className="step-editor execute-plan">
        <div className="step-editor-topbar">
          <p className="step-editor-eyebrow">⚡ Execute &ldquo;{bucket.title}&rdquo;</p>
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

        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div key="loading" className="execute-hint-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="execute-hint">{loadingLabel}</p>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div key="error" className="execute-hint-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="execute-error">{error}</p>
            </motion.div>
          )}

          {phase === 'questions' && (
            <motion.div key="questions" className="execute-questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="execute-hint">
                {isFollowUp
                  ? "Couldn't find enough yet — a bit more detail would help."
                  : "Answer as many as you'd like — skip anything you're not sure about."}
              </p>
              {questions.map((question, index) => (
                <div className="execute-question" key={question.question}>
                  <p className="execute-question-label">{question.question}</p>
                  <input
                    type="text"
                    className="execute-question-input"
                    value={answers[index] || ''}
                    onChange={(event) => handleAnswerChange(index, event.target.value)}
                    placeholder={question.placeholder}
                    autoFocus={index === 0}
                  />
                </div>
              ))}
            </motion.div>
          )}

          {phase === 'plan' && result && <PlanResult key="plan" result={result} />}
        </AnimatePresence>

        <div className="step-editor-footer">
          {phase === 'loading' && <span />}
          {phase === 'error' && (
            <motion.button type="button" className="primary-button" onClick={handleRetry} {...tapProps}>
              Try again
            </motion.button>
          )}
          {phase === 'questions' && (
            <motion.button type="button" className="primary-button" onClick={handleSubmitAnswers} {...tapProps}>
              {isFollowUp ? 'Get updated plan' : 'Find my plan'}
            </motion.button>
          )}
          {phase === 'plan' && result && (
            <>
              <motion.button type="button" className="secondary-button" onClick={loadQuestions} {...tapProps}>
                Plan again
              </motion.button>
              <motion.button type="button" className="primary-button" onClick={handleApply} {...tapProps}>
                Save to Bucket
              </motion.button>
            </>
          )}
        </div>
      </div>
    </Modal>,
    document.body,
  );
}

function PlanResult({ result }) {
  const { summary, recommendations = [], plan, sources = [] } = result;

  return (
    <motion.div className="execute-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {summary && <p className="execute-summary">{summary}</p>}

      {recommendations.length > 1 && (
        <div className="execute-recommendations">
          {recommendations.map((rec) => (
            <div className="execute-recommendation-card" key={rec.name}>
              <p className="execute-recommendation-name">{rec.name}</p>
              <p className="execute-recommendation-meta">{rec.location}</p>
              <p className="execute-recommendation-meta">{rec.price}</p>
              <p className="execute-recommendation-reason">{rec.reason}</p>
              {rec.url && (
                <a className="execute-recommendation-link" href={rec.url} target="_blank" rel="noreferrer">
                  Official site ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {plan && (
        <div className="execute-plan-card">
          <div className="execute-plan-header">
            <span className="execute-plan-date">📅 {plan.date || 'Date to be confirmed'}</span>
            <span className="execute-plan-destination">📍 {plan.destination}</span>
          </div>
          <p className="execute-plan-budget">💰 {plan.budget}</p>

          {plan.schedule?.length > 0 && (
            <div className="execute-schedule">
              <span className="execute-section-heading">Schedule</span>
              <ul className="execute-schedule-list">
                {plan.schedule.map((item) => (
                  <li className="execute-schedule-row" key={`${item.time}-${item.text}`}>
                    <span className="execute-schedule-time">{formatPlanTime(item.time)}</span>
                    <span className="execute-schedule-text">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.thingsToBring?.length > 0 && (
            <div className="execute-bring">
              <span className="execute-section-heading">What to bring</span>
              <ul className="execute-bring-list">
                {plan.thingsToBring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.nextActions?.length > 0 && (
            <div className="execute-next-actions">
              <span className="execute-section-heading">Next steps</span>
              <ul className="execute-next-actions-list">
                {plan.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {sources.length > 0 && (
        <div className="execute-sources">
          <span className="execute-section-heading">Sources</span>
          <ul className="execute-sources-list">
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default ExecutePlanFlow;
