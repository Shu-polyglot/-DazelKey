import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import PriorityCard from './PriorityCard';
import PriorityDetail from './PriorityDetail';
import AddPriorityFlow from './AddPriorityFlow';
import MilestoneRitual from '../../components/shared/MilestoneRitual';
import { useVotes } from '../../hooks/useVotes';
import { useTopPriorities, VOTES_STORAGE_KEY, MAX_TOP_PRIORITIES } from './topPriority';
import { spring } from '../../styles/motion';
import './topPriority.css';

/*
  Top 3 Priority, end to end: its own data store, its own vote engine
  (reusing useVotes' logic against a dedicated storage key -- see
  topPriority.js), its own creation flow, its own milestone ritual. This
  component needs nothing handed down from Strategy -- no buckets, no
  callbacks -- so any page/nav can drop it in as-is (`<TopPrioritySection
  />`) and get the whole feature, list through celebration.
*/
function TopPrioritySection() {
  const { priorities, addPriority } = useTopPriorities();
  const { votes, castVote, markMilestone } = useVotes(VOTES_STORAGE_KEY);

  const [expandedId, setExpandedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  // { caption, variant: 'milestone' } | null -- this module's own ritual
  // state, deliberately not shared with Realize's (see App.jsx) since
  // Top 3 Priority is meant to run independent of Strategy entirely.
  const [ritual, setRitual] = useState(null);

  const atCap = priorities.length >= MAX_TOP_PRIORITIES;
  const expanded = priorities.find((priority) => priority.id === expandedId) || null;

  function handleCastVote(priorityId) {
    const vote = castVote(priorityId);
    if (vote?.isMilestone) {
      const priority = priorities.find((p) => p.id === priorityId);
      setRitual(priority ? { caption: priority.title, variant: 'milestone' } : null);
    }
  }

  function handleMarkMilestone(priorityId, voteId, label) {
    const marked = markMilestone(voteId, label);
    if (marked) {
      const priority = priorities.find((p) => p.id === priorityId);
      setRitual(priority ? { caption: priority.title, variant: 'milestone' } : null);
    }
  }

  function handleAdd({ commitment, customMilestones }) {
    const record = addPriority({ title: commitment, customMilestones });
    if (record) {
      setIsAddOpen(false);
    }
  }

  return (
    <>
      {priorities.length === 0 ? (
        <div className="priority-empty">Write your first priority below to start voting for who you're becoming.</div>
      ) : (
        <div className="priority-list">
          {priorities.map((priority) => (
            <PriorityCard
              key={priority.id}
              priority={priority}
              votes={votes}
              onCastVote={handleCastVote}
              onMarkMilestone={handleMarkMilestone}
              onOpen={() => setExpandedId(priority.id)}
            />
          ))}
        </div>
      )}

      {atCap ? (
        <p className="priority-limit-note">
          You're focusing on {MAX_TOP_PRIORITIES} at a time -- complete or remove one to add another.
        </p>
      ) : (
        <motion.button
          type="button"
          className="secondary-button priority-add-button"
          onClick={() => setIsAddOpen(true)}
          whileHover={{ y: -1, transition: spring.hover }}
          whileTap={{ y: 1, scale: 0.97, transition: spring.press }}
        >
          + Add a Priority
        </motion.button>
      )}

      {createPortal(
        <AnimatePresence>
          {expanded && (
            <PriorityDetail
              key={expanded.id}
              priority={expanded}
              votes={votes.filter((vote) => vote.goalId === expanded.id)}
              onClose={() => setExpandedId(null)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {isAddOpen && <AddPriorityFlow key="add-priority" onSave={handleAdd} onClose={() => setIsAddOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence>
          {ritual && (
            <MilestoneRitual key="priority-ritual" caption={ritual.caption} variant={ritual.variant} onContinue={() => setRitual(null)} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export default TopPrioritySection;
