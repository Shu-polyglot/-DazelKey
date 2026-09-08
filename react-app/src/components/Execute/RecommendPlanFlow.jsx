import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import BucketInviteModal from '../BucketList/BucketInviteModal';
import TimePickerClock from '../shared/TimePickerClock';
import { supabase } from '../../lib/supabase';
import { sortPlanItems, formatPlanTime } from '../../lib/buckets';
import { formatDate } from '../../lib/dates';
import { describeFreeEvening } from '../../lib/weeklyNudge';
import { getPlanShortcuts } from '../../lib/shortcuts';
import { spring, easing } from '../../styles/motion';
import '../Modals/Modals.css';
import '../Modals/BucketPlanEditor.css';
import './Execute.css';
import './RecommendPlanFlow.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easing.emphasized } },
  exit: { opacity: 0, filter: 'blur(12px)', transition: { duration: 0.4, ease: easing.exit } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, delay: 0.15, ease: easing.emphasized } },
};

function createDraftId(index) {
  return `plan-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
}

/*
  Recommend -- replaces Execute + Plan for "do"-shaped Buckets (see
  ExpandedBucketCard/WeeklyNudgeCard, and classify-bucket-difficulty's
  goalShape). One Gemini call, no clarifying-questions round-trip: the
  recommendation uses whatever's already known (difficulty
  classification, a detected free evening, this person's own completed
  Achievements for personalization) and comes back as ONE confident
  plan to react to, not several similar options to compare -- Human
  Agency here means "here's what I'd do", not an intake form.

  Presented as a full-screen cinematic moment (reusing CompleteScreen's
  weight, see RecommendPlanFlow.css) rather than another boxed form
  modal, since the whole point of this rewrite was that Execute/Plan
  both read as administrative rather than exciting. The schedule is
  directly editable in place (Plan's old manual-editing role folded in
  here rather than kept as a separate destination), and shortcuts/
  Invite turn the recommendation into something immediately actionable.
*/
function RecommendPlanFlow({ bucket, buckets, googleCalendar, onApply, onClose }) {
  const [phase, setPhase] = useState(bucket.executePlan ? 'plan' : 'loading');
  const [result, setResult] = useState(bucket.executePlan || null);
  const [error, setError] = useState('');
  const [scheduleDraft, setScheduleDraft] = useState([]);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  function loadScheduleDraft(plan) {
    const items = (plan?.schedule || []).map((item, index) => ({ id: createDraftId(index), time: item.time, text: item.text }));
    setScheduleDraft(sortPlanItems(items));
  }

  async function generate() {
    setPhase('loading');
    setError('');
    try {
      // Only this person's own completed Achievements, most recent
      // first -- personalization context, never sent anywhere but this
      // one Gemini call (see recommend-plan's own header comment on why
      // "Past Experiences" belongs in the AI's input at all).
      const pastExperiences = buckets
        .filter((entry) => entry.status === 'completed')
        .slice(0, 8)
        .map((entry) => entry.title);
      const soonestFreeEvening = googleCalendar?.freeEvenings?.[0];
      const freeEvening = soonestFreeEvening ? { label: describeFreeEvening(soonestFreeEvening) } : null;

      const { data, error: invokeError } = await supabase.functions.invoke('recommend-plan', {
        body: {
          bucketTitle: bucket.title,
          place: bucket.place,
          mode: bucket.mode,
          when: bucket.when,
          difficulty: bucket.difficulty,
          freeEvening,
          pastExperiences,
        },
      });
      if (invokeError) {
        throw new Error(invokeError.message || 'Something went wrong.');
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      if (data.status === 'needs_input') {
        setError(data.questions?.[0] || "Couldn't find enough to recommend something yet.");
        setPhase('error');
        return;
      }
      setResult(data);
      loadScheduleDraft(data.plan);
      setPhase('plan');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }

  useEffect(() => {
    if (bucket.executePlan) {
      loadScheduleDraft(bucket.executePlan.plan);
    } else {
      generate();
    }
    // bucket is fixed for the life of this flow (a fresh instance mounts
    // per Bucket), so this only ever needs to run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddScheduleItem() {
    setScheduleDraft((prev) => [...prev, { id: createDraftId(prev.length), time: '09:00', text: '' }]);
  }

  function handleScheduleTextChange(id, text) {
    setScheduleDraft((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  }

  function handleScheduleTimeDone(id, time) {
    setScheduleDraft((prev) => sortPlanItems(prev.map((item) => (item.id === id ? { ...item, time } : item))));
    setEditingTimeId(null);
  }

  function handleRemoveScheduleItem(id) {
    setScheduleDraft((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    const editedResult = { ...result, plan: { ...result.plan, schedule: scheduleDraft.map(({ time, text }) => ({ time, text })) } };
    onApply(editedResult);
    onClose();
  }

  const editingItem = scheduleDraft.find((item) => item.id === editingTimeId) || null;
  const shortcuts = result?.plan ? getPlanShortcuts(result.plan, bucket.difficulty) : [];
  const groundedRecommendations = result?.recommendations || [];

  return createPortal(
    <motion.div className="recommend-flow" initial="hidden" animate="visible" exit="exit" variants={overlayVariants}>
      <motion.button
        type="button"
        className="icon-button recommend-flow-close"
        aria-label="Close"
        onClick={onClose}
        whileHover={{ rotate: 90, transition: spring.hover }}
        whileTap={{ scale: 0.88, transition: spring.press }}
      >
        ×
      </motion.button>

      {phase === 'loading' && (
        <div className="execute-hint-stage recommend-flow-stage">
          <p className="execute-hint">Finding your plan…</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="execute-hint-stage recommend-flow-stage">
          <p className="execute-error">{error}</p>
          <motion.button type="button" className="primary-button" onClick={generate} {...tapProps}>
            Try again
          </motion.button>
        </div>
      )}

      {phase === 'plan' && result?.plan && (
        <motion.div className="recommend-flow-content" variants={contentVariants} initial="hidden" animate="visible">
          <div className="recommend-flow-hero">
            <span className="recommend-flow-eyebrow">Recommended</span>
            <h2 className="recommend-flow-destination">{result.plan.destination}</h2>
            <div className="recommend-flow-meta">
              <span>📅 {result.plan.date ? formatDate(result.plan.date) : 'Date to be confirmed'}</span>
              <span>💰 {result.plan.budget}</span>
            </div>
            {result.summary && <p className="execute-summary recommend-flow-summary">{result.summary}</p>}
          </div>

          <div className="plan-editor-itinerary recommend-flow-schedule">
            <div className="plan-editor-itinerary-heading">
              <span>Schedule</span>
              <motion.button type="button" className="plan-editor-add-button" onClick={handleAddScheduleItem} {...tapProps}>
                + Add
              </motion.button>
            </div>
            {scheduleDraft.length === 0 ? (
              <div className="plan-editor-empty">No stops yet -- add the first one below.</div>
            ) : (
              <div className="plan-editor-list">
                {scheduleDraft.map((item) => (
                  <div className="plan-editor-row" key={item.id}>
                    <button type="button" className="plan-editor-time-button" onClick={() => setEditingTimeId(item.id)}>
                      {formatPlanTime(item.time)}
                    </button>
                    <input
                      type="text"
                      className="plan-editor-text-input"
                      value={item.text}
                      onChange={(event) => handleScheduleTextChange(item.id, event.target.value)}
                      placeholder="What happens here?"
                    />
                    <button
                      type="button"
                      className="icon-button plan-editor-remove"
                      onClick={() => handleRemoveScheduleItem(item.id)}
                      aria-label="Remove this stop"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result.plan.thingsToBring?.length > 0 && (
            <div className="recommend-flow-section">
              <span className="execute-section-heading">What to bring</span>
              <ul className="execute-bring-list">
                {result.plan.thingsToBring.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {result.plan.nextActions?.length > 0 && (
            <div className="recommend-flow-section">
              <span className="execute-section-heading">Next steps</span>
              <ul className="execute-next-actions-list">
                {result.plan.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {groundedRecommendations.length > 0 && (
            <div className="recommend-flow-section">
              <span className="execute-section-heading">Found for you</span>
              <div className="execute-recommendations">
                {groundedRecommendations.map((rec) => (
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
            </div>
          )}

          {shortcuts.length > 0 && (
            <div className="recommend-flow-section">
              <span className="execute-section-heading">Shortcuts</span>
              <div className="recommend-flow-shortcuts">
                {shortcuts.map((shortcut) => (
                  <a key={shortcut.id} className="recommend-flow-shortcut" href={shortcut.url} target="_blank" rel="noreferrer">
                    <span aria-hidden="true">{shortcut.icon}</span>
                    {shortcut.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="recommend-flow-actions">
            <motion.button type="button" className="secondary-button" onClick={() => setIsInviteOpen(true)} {...tapProps}>
              Invite a friend
            </motion.button>
            <motion.button type="button" className="secondary-button" onClick={generate} {...tapProps}>
              Try another
            </motion.button>
            <motion.button type="button" className="primary-button" onClick={handleSave} {...tapProps}>
              Save to Bucket
            </motion.button>
          </div>
        </motion.div>
      )}

      {createPortal(
        <AnimatePresence>
          {editingItem && (
            <TimePickerClock
              key="time-picker"
              time={editingItem.time}
              onDone={(time) => handleScheduleTimeDone(editingItem.id, time)}
              onCancel={() => setEditingTimeId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {isInviteOpen && (
        <BucketInviteModal bucket={bucket} plan={result} onClose={() => setIsInviteOpen(false)} />
      )}
    </motion.div>,
    document.body,
  );
}

export default RecommendPlanFlow;
