/*
  Free Time detection (Wantを現実にするLife OS.md §4-6, §14 -- "What could
  I live?"), the piece of the MVP roadmap Weekly Nudge's picking logic
  was still missing: knowing *when* this week someone is actually free,
  not just *which* Bucket to suggest.

  Deliberately a client-only OAuth flow (Google Identity Services'
  token client, not the authorization-code flow) -- no refresh token
  ever leaves the browser, so there is no new Supabase table, Edge
  Function, or secret to hold it. The tradeoff is that the access token
  only lives for this tab/session (~1h, GIS-managed) and a silent
  reconnect (prompt: '') can silently fail, in which case this whole
  feature quietly falls back to "not connected" -- same
  never-block-the-app-on-a-remote-failure posture as useLocalStorage's
  Supabase sync.
*/

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

let gisLoadPromise = null;

// Injects the GIS script at most once per page load, however many
// callers ask for it.
export function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (gisLoadPromise) {
    return gisLoadPromise;
  }
  gisLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Google Identity Services.'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

// Resolves an access token, or rejects with the GIS error response.
// `prompt: ''` attempts a silent reconnect (no popup) -- used to
// restore a connection on app load without asking again; `prompt:
// 'consent'` is the explicit "Connect" button's interactive flow.
export async function requestCalendarAccessToken({ clientId, prompt }) {
  await loadGoogleIdentityServices();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      prompt,
      callback: (response) => {
        if (response.error) {
          reject(response);
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => reject(error),
    });
    tokenClient.requestAccessToken();
  });
}

// One freeBusy.query call covering `days` days starting today, in the
// viewer's own local timezone (freeBusy takes IANA zone names directly,
// no manual offset math needed). Returns the raw busy intervals for the
// primary calendar -- getFreeEveningsThisWeek below turns that into
// something a UI can render.
export async function fetchPrimaryBusyIntervals(accessToken, { now = new Date(), days = 7 } = {}) {
  const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + days);

  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      items: [{ id: 'primary' }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Calendar freeBusy request failed (${response.status}).`);
  }

  const data = await response.json();
  const busy = data.calendars?.primary?.busy || [];
  return busy.map((interval) => ({ start: new Date(interval.start), end: new Date(interval.end) }));
}

// The one evening window this feature reasons about -- matches the
// Life OS note's own worked example ("今日18:00〜21:00なら近場で行けそう")
// rather than trying to find every gap in someone's whole day, which
// would surface slots too short or too oddly-timed to actually act on.
export const EVENING_WINDOW = { startHour: 18, endHour: 21 };

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Pure function: given the raw busy intervals from fetchPrimaryBusyIntervals
// and "now", returns which of the next 7 evenings (see EVENING_WINDOW)
// are free -- today only counts if its own evening window hasn't
// started yet. Each entry carries real Date objects so a caller can
// format them however it needs, plus `dayIndex` (0 = today) for picking
// "the soonest one" without re-deriving it.
export function getFreeEveningsThisWeek(busyIntervals, { now = new Date(), days = 7 } = {}) {
  const freeEvenings = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayIndex);
    const windowStart = new Date(day);
    windowStart.setHours(EVENING_WINDOW.startHour, 0, 0, 0);
    const windowEnd = new Date(day);
    windowEnd.setHours(EVENING_WINDOW.endHour, 0, 0, 0);

    if (windowEnd <= now) {
      continue;
    }

    const isBusy = busyIntervals.some((interval) => intervalsOverlap(windowStart, windowEnd, interval.start, interval.end));
    if (!isBusy) {
      freeEvenings.push({ dayIndex, date: day, windowStart, windowEnd });
    }
  }

  return freeEvenings;
}

// "Commitment検出" -- the Life OS note's own term for the other half of
// Free Time detection: Calendar isn't just useful for finding gaps, it
// also names how much of the week is *already decided* (§4-6,
// "Commitment vs Life" / "Uncommitted Life"). A plain count of the raw
// busy blocks freeBusy returned -- deliberately not deduplicated or
// merged, since each block is one real thing already on the calendar,
// however small.
export function countCommitmentsThisWeek(busyIntervals) {
  return busyIntervals.length;
}
