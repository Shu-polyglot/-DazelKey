import { useState } from 'react';
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
  A short back-and-forth with Gemini (see supabase/functions/plan-goal-
  chat) about one specific Realize goal, ending in a structured plan the
  person can drop straight into AddGoalFlow's amount/checklist steps.
  This component only ever talks to that one Edge Function -- it has no
  idea Gemini is what's on the other end, and never sees an API key.

  `messages` is kept in the shape the Edge Function already expects
  ({ role: 'user' | 'assistant', content }) so it can be forwarded
  as-is on every call rather than translated back and forth.
*/
function GoalPlanChat({ goalTitle, onApply, onClose }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);

  async function callFunction(nextMessages, finalize) {
    const { data, error: invokeError } = await supabase.functions.invoke('plan-goal-chat', {
      body: { goalTitle, messages: nextMessages, finalize },
    });
    if (invokeError) {
      throw new Error(invokeError.message || 'Something went wrong.');
    }
    if (data?.error) {
      throw new Error(data.error);
    }
    return data;
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || isSending) {
      return;
    }
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setDraft('');
    setError('');
    setIsSending(true);
    try {
      const data = await callFunction(nextMessages, false);
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleFinalize() {
    if (isSending) {
      return;
    }
    setError('');
    setIsSending(true);
    try {
      const data = await callFunction(messages, true);
      setPlan(data.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  function handleApply() {
    onApply(plan);
  }

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

        {plan ? (
          <div className="goal-plan-chat-summary">
            <p className="goal-plan-chat-summary-text">{plan.summary}</p>
            <p className="goal-plan-chat-summary-amount">Estimated total: ¥{Number(plan.goalAmount).toLocaleString('en-US')}</p>
            {plan.checklist.length > 0 && (
              <ul className="goal-plan-chat-summary-list">
                {plan.checklist.map((item) => (
                  <li key={item.label}>
                    {item.isMilestone ? '★ ' : ''}
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="goal-plan-chat-thread">
            {messages.length === 0 && (
              <p className="goal-plan-chat-hint">
                Tell the assistant a bit about this goal — timeline, budget flexibility, anything it should know.
              </p>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`goal-plan-chat-bubble is-${message.role}`}>
                {message.content}
              </div>
            ))}
            {isSending && <div className="goal-plan-chat-bubble is-assistant is-thinking">…</div>}
          </div>
        )}

        {error && <p className="goal-plan-chat-error">{error}</p>}

        <div className="step-editor-footer">
          {plan ? (
            <>
              <motion.button type="button" className="secondary-button" onClick={() => setPlan(null)} {...tapProps}>
                Keep talking
              </motion.button>
              <motion.button type="button" className="primary-button" onClick={handleApply} {...tapProps}>
                Use this plan
              </motion.button>
            </>
          ) : (
            <>
              <input
                type="text"
                className="step-editor-field-input goal-plan-chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Say something…"
                disabled={isSending}
                autoFocus
              />
              <motion.button type="button" className="secondary-button" onClick={handleSend} disabled={isSending || !draft.trim()} {...tapProps}>
                Send
              </motion.button>
              <motion.button
                type="button"
                className="primary-button"
                onClick={handleFinalize}
                disabled={isSending || messages.length === 0}
                {...tapProps}
              >
                Finalize plan
              </motion.button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default GoalPlanChat;
