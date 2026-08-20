import { useLocalStorage } from './useLocalStorage';
import { todayIso } from '../lib/dates';

const STORAGE_KEY = 'lifeos-contributions-v1';

/*
  "Add extra" records -- a lightweight, separate store from useVotes on
  purpose. A vote is one-per-goal-per-day and drives the contribution
  grid; an extra is an arbitrary amount, any number of times a day, that
  never touches the grid at all. Both feed the same money total (see
  lib/doing.js), but they're different enough shapes that forcing extras
  through the vote store would mean faking a "date" uniqueness constraint
  that doesn't apply to them.
*/
export function useContributions() {
  const [contributions, setContributions] = useLocalStorage(STORAGE_KEY, () => []);

  // Returns the record actually added (or null if the amount was
  // invalid) -- mirrors useVotes' castVote, so callers can react to a
  // fresh contribution (e.g. check for goal completion) without this
  // hook knowing anything about that.
  function addContribution(goalId, amount, tag) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    const record = { id: `${goalId}-${Date.now()}`, goalId, amount: value, tag: tag || null, date: todayIso() };
    setContributions((prev) => [...prev, record]);
    return record;
  }

  return { contributions, addContribution };
}
