import { useLocalStorage } from '../../hooks/useLocalStorage';
import { todayIso } from '../../lib/dates';

/*
  Core's own data stores -- deliberately not Buckets, and deliberately
  split into two tiers. A goal (Core's "priority") is just a freeform
  identity-commitment sentence and a container; it carries no vote/
  milestone/progress data of its own. A habit belongs to exactly one
  goal and is the actual unit that gets logged day to day (see
  useHabitLogs below) -- the heatmap in GoalDetail reads/writes habits
  and logs, never the goal directly.
*/
const STORAGE_KEY = 'dazelkey-top-priorities-v1';
const LEGACY_STORAGE_KEY = 'lifeos-top-priorities-v1';
const HABITS_STORAGE_KEY = 'dazelkey-habits-v1';
const HABIT_LOGS_STORAGE_KEY = 'dazelkey-habit-logs-v1';

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

  return { priorities, addPriority };
}

function normalizeHabit(habit) {
  return {
    id: habit.id,
    goalId: habit.goalId,
    name: habit.name || '',
    createdAt: habit.createdAt || todayIso(),
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

  function deleteHabit(id) {
    setStored((prev) => prev.filter((habit) => habit.id !== id));
  }

  return { habits, addHabit, deleteHabit };
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
