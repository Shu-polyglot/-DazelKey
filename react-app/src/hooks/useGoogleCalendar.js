import { useCallback, useEffect, useState } from 'react';
import {
  requestCalendarAccessToken,
  fetchPrimaryBusyIntervals,
  getFreeEveningsThisWeek,
} from '../lib/googleCalendar';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;

// Device-local only, deliberately not run through useLocalStorage (no
// Supabase sync) -- it is just a hint ("did this browser connect
// before?") to attempt a silent reconnect on load, never a credential.
// The actual access token itself is never persisted anywhere (see
// lib/googleCalendar's own header comment on the client-only OAuth
// tradeoff).
const CONNECTED_HINT_KEY = 'dazelkey-google-calendar-connected-v1';

function readConnectedHint() {
  try {
    return localStorage.getItem(CONNECTED_HINT_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeConnectedHint(value) {
  try {
    if (value) {
      localStorage.setItem(CONNECTED_HINT_KEY, 'true');
    } else {
      localStorage.removeItem(CONNECTED_HINT_KEY);
    }
  } catch {
    // Best-effort only -- worst case is just re-prompting next visit.
  }
}

// Surfaces "which evenings this week are actually free" (see
// lib/googleCalendar) so Weekly Nudge (useWeeklyNudge/WeeklyNudgeCard)
// can suggest a real slot instead of a bare "this week". Google
// Calendar access is entirely optional -- every consumer of this hook
// must read `freeEvenings` as "unknown, not necessarily busy" whenever
// `status !== 'connected'`, the same non-blocking posture the rest of
// this app takes toward Supabase.
export function useGoogleCalendar() {
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [freeEvenings, setFreeEvenings] = useState([]);
  const [error, setError] = useState('');

  const isAvailable = Boolean(CLIENT_ID);

  const refreshFreeEvenings = useCallback(async (accessToken) => {
    const busyIntervals = await fetchPrimaryBusyIntervals(accessToken);
    setFreeEvenings(getFreeEveningsThisWeek(busyIntervals));
  }, []);

  const connect = useCallback(
    async (prompt = 'consent') => {
      if (!isAvailable) {
        return;
      }
      setStatus('connecting');
      setError('');
      try {
        const accessToken = await requestCalendarAccessToken({ clientId: CLIENT_ID, prompt });
        await refreshFreeEvenings(accessToken);
        writeConnectedHint(true);
        setStatus('connected');
      } catch (err) {
        // A silent reconnect (prompt: '') failing on load is expected
        // (token expired, consent revoked, third-party cookies blocked)
        // -- fall back to disconnected quietly rather than surfacing an
        // error for something the user never explicitly asked for just
        // now.
        writeConnectedHint(false);
        setStatus(prompt === '' ? 'idle' : 'error');
        setError(err?.error_description || err?.message || 'Unable to connect to Google Calendar.');
      }
    },
    [isAvailable, refreshFreeEvenings],
  );

  function disconnect() {
    writeConnectedHint(false);
    setStatus('idle');
    setFreeEvenings([]);
    setError('');
  }

  useEffect(() => {
    if (isAvailable && readConnectedHint()) {
      connect('');
    }
    // Only ever attempted once, on mount -- re-running this whenever
    // `connect` is redefined would silently re-trigger a reconnect
    // attempt after every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isAvailable, status, freeEvenings, error, connect, disconnect };
}
