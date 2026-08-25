import { useLocalStorage } from '../../hooks/useLocalStorage';
import { todayIso } from '../../lib/dates';

/*
  Core's own data stores. A goal (Core's "priority") is just a freeform
  identity-commitment sentence and a container -- it carries no vote/
  milestone/progress data of its own.

  useHabits/useHabitLogs are the retired habit-tracking system (goal ->
  habit -> per-day done log, with its own Mon-Sun grid and heatmaps).
  The UI for creating/viewing habits and logs is gone -- Core now records
  free-form Actions instead (see usePriorityActions below), any number
  of times, with no day/streak semantics at all. These two hooks stay
  exactly as they were, unused by any live screen, purely so existing
  habit/log data already in localStorage keeps loading correctly (never
  wiped) and stays available to whatever later arranges it into Records
  Timeline -- see this module's own comments on archiveHabit/
  normalizeHabit for why that data was already built to outlive its
  habit ever being "active".
*/
const STORAGE_KEY = 'dazelkey-top-priorities-v1';
const LEGACY_STORAGE_KEY = 'lifeos-top-priorities-v1';
const HABITS_STORAGE_KEY = 'dazelkey-habits-v1';
const HABIT_LOGS_STORAGE_KEY = 'dazelkey-habit-logs-v1';
const ACTIONS_STORAGE_KEY = 'dazelkey-priority-actions-v1';

export const MAX_TOP_PRIORITIES = 3;

function normalizePriority(priority, index) {
  return {
    id: priority.id || index + 1,
    title: priority.title || '',
    createdAt: priority.createdAt || todayIso(),
  };
}

export function useTopPriorities() {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, () => [], LEGACY_STORAGE_KEY);
  const priorities = Array.isArray(stored) ? stored.map(normalizePriority) : [];

  // Safety net alongside the UI's own cap check (see TopPrioritySection
  // hiding "+ Add a Priority" at MAX_TOP_PRIORITIES) -- a no-op past the
  // cap rather than silently letting a 4th in.
  function addPriority({ title }) {
    if (priorities.length >= MAX_TOP_PRIORITIES || !title?.trim()) {
      return null;
    }
    const record = normalizePriority({ id: Date.now(), title: title.trim(), createdAt: todayIso() });
    setStored((prev) => [...prev, record]);
    return record;
  }

  // Edits the one field a priority actually has -- its own identity-
  // commitment sentence (see this module's own header comment: "title"
  // here IS that sentence, there's no separate short label). A no-op on
  // an empty trim, same validation addPriority already applies.
  function updatePriority(id, { title }) {
    const trimmed = title?.trim();
    if (!trimmed) {
      return;
    }
    setStored((prev) => prev.map((priority) => (priority.id === id ? { ...priority, title: trimmed } : priority)));
  }

  // Habits/logs referencing this goal are deliberately left as-is, not
  // cascade-deleted -- the same orphan-tolerant choice deleteHabit below
  // already makes for its own logs (see that comment): nothing else in
  // the app resolves them without a live priority to filter by, so they
  // simply stop being reachable rather than needing an explicit sweep.
  function deletePriority(id) {
    setStored((prev) => prev.filter((priority) => priority.id !== id));
  }

  return { priorities, addPriority, updatePriority, deletePriority };
}

function normalizeHabit(habit) {
  return {
    id: habit.id,
    goalId: habit.goalId,
    name: habit.name || '',
    createdAt: habit.createdAt || todayIso(),
    // Historical: set once a habit with at least one log got "removed"
    // through the old edit screen -- an archived habit dropped out of
    // every active list but kept its id/name resolvable, so its past
    // logs kept reading correctly wherever they were looked back on. No
    // UI reaches archiveHabit anymore (see this module's own header
    // comment), but the field/data stay exactly as they were.
    archivedAt: habit.archivedAt || null,
  };
}

// One flat store for every habit across every goal -- mirrors
// useTopPriorities/useBuckets, called once and filtered per goal by
// callers, so every screen reads/writes the same source. No cap: a
// goal can carry as many habits as the user wants.
export function useHabits() {
  const [stored, setStored] = useLocalStorage(HABITS_STORAGE_KEY, () => []);
  const habits = Array.isArray(stored) ? stored.map(normalizeHabit) : [];

  function addHabit(goalId, name) {
    const trimmed = name?.trim();
    if (!goalId || !trimmed) {
      return null;
    }
    const record = normalizeHabit({ id: Date.now(), goalId, name: trimmed, createdAt: todayIso() });
    setStored((prev) => [...prev, record]);
    return record;
  }

  // Historical, like archiveHabit below -- no UI calls either anymore
  // (see this module's own header comment), kept only so the shape of
  // this hook doesn't change out from under any stored data.
  function deleteHabit(id) {
    setStored((prev) => prev.filter((habit) => habit.id !== id));
  }

  function archiveHabit(id) {
    setStored((prev) => prev.map((habit) => (habit.id === id ? { ...habit, archivedAt: todayIso() } : habit)));
  }

  return { habits, addHabit, deleteHabit, archiveHabit };
}

function normalizeLog(log) {
  return {
    id: log.id,
    habitId: log.habitId,
    date: log.date,
    done: true,
    photo: log.photo || null,
    journal: log.journal || null,
    time: log.time || todayIso(),
  };
}

// One flat store for every day's habit log, across every habit. Only
// "done" days ever get a record here -- an untouched cell simply has
// no matching log, so undoing a day is a delete, not a done:false flag.
export function useHabitLogs() {
  const [stored, setStored] = useLocalStorage(HABIT_LOGS_STORAGE_KEY, () => []);
  const logs = Array.isArray(stored) ? stored.map(normalizeLog) : [];

  function getLog(habitId, date) {
    return logs.find((log) => log.habitId === habitId && log.date === date) || null;
  }

  // Confirms a tap on an undone cell as done -- the one place `done`
  // actually gets set. photo/journal are both optional; an empty log
  // (no photo, no journal) is still a valid, fully-recorded day.
  function recordLog(habitId, date, { photo, journal } = {}) {
    const existing = getLog(habitId, date);
    if (existing) {
      setStored((prev) =>
        prev.map((log) =>
          log.id === existing.id ? { ...log, photo: photo || null, journal: journal?.trim() || null } : log,
        ),
      );
      return existing;
    }
    const record = normalizeLog({
      id: `${habitId}-${date}`,
      habitId,
      date,
      photo: photo || null,
      journal: journal?.trim() || null,
      time: new Date().toISOString(),
    });
    setStored((prev) => [...prev, record]);
    return record;
  }

  // Edits an already-done day's photo/journal (either field may be
  // cleared independently by passing null) without touching `done`.
  function updateLogMedia(habitId, date, { photo, journal }) {
    const existing = getLog(habitId, date);
    if (!existing) {
      return false;
    }
    setStored((prev) =>
      prev.map((log) =>
        log.id === existing.id
          ? { ...log, photo: photo === undefined ? log.photo : photo, journal: journal === undefined ? log.journal : journal?.trim() || null }
          : log,
      ),
    );
    return true;
  }

  // "Mark as not done" -- removes the log entirely, so there's no
  // undone-but-still-has-a-photo state to reconcile.
  function undoLog(habitId, date) {
    setStored((prev) => prev.filter((log) => !(log.habitId === habitId && log.date === date)));
  }

  return { logs, getLog, recordLog, updateLogMedia, undoLog };
}

function normalizeAction(action) {
  return {
    id: action.id,
    goalId: action.goalId,
    photo: action.photo || null,
    journal: action.journal || null,
    time: action.time || new Date().toISOString(),
  };
}

// Core's live recording mechanism: a free-form photo/journal moment
// against a goal, any number of times, whenever -- no habit, no day
// slot, no done/undone state. One flat store across every goal, same
// shape as useHabits/useHabitLogs above, filtered per goal by callers.
// Feeds GoalCard's "Action" button and, from there, HabitRecordsTimeline
// (still that component/name -- see its own header comment).
export function usePriorityActions() {
  const [stored, setStored] = useLocalStorage(ACTIONS_STORAGE_KEY, () => []);
  const actions = Array.isArray(stored) ? stored.map(normalizeAction) : [];

  function addAction(goalId, { photo, journal } = {}) {
    if (!goalId) {
      return null;
    }
    const record = normalizeAction({
      id: `${goalId}-${Date.now()}`,
      goalId,
      photo: photo || null,
      journal: journal?.trim() || null,
      time: new Date().toISOString(),
    });
    setStored((prev) => [...prev, record]);
    return record;
  }

  // Edits an already-recorded Action's photo/journal (either field may be
  // cleared by passing null) without touching its own timestamp -- same
  // "edit, don't re-timestamp" shape updateLogMedia used for habit logs.
  function updateAction(id, { photo, journal }) {
    setStored((prev) =>
      prev.map((action) =>
        action.id === id
          ? { ...action, photo: photo === undefined ? action.photo : photo, journal: journal === undefined ? action.journal : journal?.trim() || null }
          : action,
      ),
    );
  }

  function deleteAction(id) {
    setStored((prev) => prev.filter((action) => action.id !== id));
  }

  return { actions, addAction, updateAction, deleteAction };
}
