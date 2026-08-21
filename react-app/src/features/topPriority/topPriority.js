import { useLocalStorage } from '../../hooks/useLocalStorage';
import { todayIso } from '../../lib/dates';

/*
  Top 3 Priority's own data store -- deliberately not a Bucket. A
  priority is a freeform identity-commitment sentence tracked by daily
  votes, and the whole point of this module is that Bucket List code
  never needs to know it exists. `VOTES_STORAGE_KEY` is passed into the
  shared useVotes() hook (see src/hooks/useVotes.js) so voting reuses
  that exact engine -- one-vote-per-day, auto-threshold milestones, hand-
  marked custom ones -- without a second implementation of it.
*/
const STORAGE_KEY = 'lifeos-top-priorities-v1';
export const VOTES_STORAGE_KEY = 'lifeos-top-priority-votes-v1';

export const MAX_TOP_PRIORITIES = 3;
export const MAX_PRIORITY_MILESTONES = 3;

function normalizePriority(priority, index) {
  return {
    id: priority.id || index + 1,
    title: priority.title || '',
    customMilestones: Array.isArray(priority.customMilestones)
      ? priority.customMilestones.filter(Boolean).slice(0, MAX_PRIORITY_MILESTONES)
      : [],
    createdAt: priority.createdAt || todayIso(),
  };
}

export function useTopPriorities() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, () => []);
  const priorities = Array.isArray(stored) ? stored.map(normalizePriority) : [];

  // Safety net alongside the UI's own cap check (see TopPrioritySection
  // hiding "+ Add a Priority" at MAX_TOP_PRIORITIES) -- a no-op past the
  // cap rather than silently letting a 4th in.
  function addPriority({ title, customMilestones }) {
    if (priorities.length >= MAX_TOP_PRIORITIES || !title?.trim()) {
      return null;
    }
    const record = normalizePriority({ id: Date.now(), title: title.trim(), customMilestones, createdAt: todayIso() });
    setStored((prev) => [...prev, record]);
    return record;
  }

  return { priorities, addPriority };
}
