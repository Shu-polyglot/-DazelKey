import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import RecommendPlanFlow from '../Execute/RecommendPlanFlow';
import { getWhenLabel } from '../../lib/buckets';
import { describeFreeEvening } from '../../lib/weeklyNudge';
import { entranceTransition, spring } from '../../styles/motion';
import '../Modals/Modals.css';
import './WeeklyNudgeCard.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  The one place Strategy suggests instead of waiting to be opened (see
  hooks/useWeeklyNudge) -- "Answer Engine vs. Experience Engine" from the
  Obsidian design notes (see CLAUDE.md). Deliberately a single soft
  question, not an instruction: #9 Human Agency means this offers,
  it never tells someone what they should do, and "Not this week" has to
  be exactly as easy to tap as "Recommend".

  `freeEvening` (from useGoogleCalendar, optional) swaps the generic
  question for a specific offered slot ("Today 18:00–21:00 looks free —
  want to go?") once a real Google Calendar connection can back it up --
  the exact Human Agency "Good" example from the Life OS note, degrading
  to the generic ask whenever Calendar isn't connected or nothing's
  free.
*/
function WeeklyNudgeCard({ bucket, buckets, googleCalendar, freeEvening, onUpdate, onDismiss }) {
  const [isRecommendOpen, setIsRecommendOpen] = useState(false);

  if (!bucket) {
    return null;
  }

  const freeSlotLabel = describeFreeEvening(freeEvening);
  // Same "become" exclusion as ExpandedBucketCard's own Recommend
  // gating (see that component's comment) -- an ongoing pursuit like
  // "Score 900 on the TOEIC" doesn't get a dated-itinerary
  // recommendation.
  const showRecommend = bucket.difficulty?.goalShape !== 'become';

  // Same apply logic as ExpandedBucketCard's handleApplyRecommendPlan --
  // the schedule becomes this Bucket's own Itinerary and `place` fills
  // in only if it wasn't already set.
  function handleApplyRecommendPlan(result) {
    const patch = { executePlan: result };
    if (result.plan) {
      patch.planItems = (result.plan.schedule || []).map((item, index) => ({
        id: `plan-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        time: item.time,
        text: item.text,
      }));
      if (!bucket.place && result.plan.destination) {
        patch.place = result.plan.destination;
      }
    }
    onUpdate(bucket.id, patch);
  }

  return (
    <motion.div
      className="weekly-nudge-card"
      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={entranceTransition(0)}
    >
      <span className="weekly-nudge-eyebrow">This week</span>
      <p className="weekly-nudge-question">
        {freeSlotLabel ? `${freeSlotLabel} looks free — want to go?` : 'Could you make time for this?'}
      </p>
      <p className="weekly-nudge-title">{bucket.title}</p>
      <p className="weekly-nudge-meta">
        {bucket.place ? `${bucket.place} · ` : ''}
        {getWhenLabel(bucket.when)}
      </p>

      <div className="weekly-nudge-actions">
        {showRecommend && (
          <motion.button type="button" className="secondary-button" onClick={() => setIsRecommendOpen(true)} {...tapProps}>
            ✨ Recommend
          </motion.button>
        )}
        <motion.button type="button" className="weekly-nudge-dismiss" onClick={onDismiss} {...tapProps}>
          Not this week
        </motion.button>
      </div>

      {createPortal(
        <AnimatePresence>
          {isRecommendOpen && (
            <RecommendPlanFlow
              key="recommend-plan-flow"
              bucket={bucket}
              buckets={buckets}
              googleCalendar={googleCalendar}
              onApply={handleApplyRecommendPlan}
              onClose={() => setIsRecommendOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}

export default WeeklyNudgeCard;
