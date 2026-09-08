/*
  Deep-link shortcuts for a Recommend-generated plan (see
  RecommendPlanFlow) -- the "Shortcut Principle" from the Life OS note
  applied literally: remove the friction *around* an experience
  (finding it, booking it, getting there, remembering it) without
  needing any API partnership, OAuth, or secret. Every one of these is
  just a URL built from data already on the plan; the browser/OS
  handles the rest.

  Each builder returns null when it doesn't have what it needs (no
  silent guessing) -- getPlanShortcuts filters those out, and only adds
  a shortcut at all when the classified `difficulty` makes it likely to
  actually matter (see that function's own comments) rather than
  showing every possible link on every plan regardless of relevance.
*/

// Optional, unset by default -- see .env.example. If DazelKey ever
// joins an affiliate program, dropping the id in here is the only
// change needed; every existing link keeps working unaffiliated until
// then (see `**DazelKey — Social Impact**.md`'s own Business Impact
// section on where this revenue is meant to come from).
const AIRBNB_AFFILIATE_ID = import.meta.env.VITE_AIRBNB_AFFILIATE_ID || '';

export function buildMapsUrl(destination) {
  if (!destination) {
    return null;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

function toCalendarDateRange(dateIso) {
  const start = new Date(`${dateIso}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const fmt = (date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  return `${fmt(start)}/${fmt(end)}`;
}

// A plain "add this event" template URL -- opens Google Calendar's own
// confirmation screen for whichever Google account the viewer is
// signed into there, no OAuth/write-scope involved on DazelKey's side.
// This is the "Calendarへの追加" step from the Life OS note's own MVP
// roadmap, done without ever asking for calendar *write* access.
export function buildCalendarUrl({ title, date, destination, schedule }) {
  if (!date) {
    return null;
  }
  const details = Array.isArray(schedule) && schedule.length > 0 ? schedule.map((item) => `${item.time} ${item.text}`).join('\n') : '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || destination || '',
    dates: toCalendarDateRange(date),
    location: destination || '',
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Japan-first on purpose -- for a domestic trip, a train-route search
// is a far more commonly actionable shortcut here than a flight search
// (see getPlanShortcuts).
export function buildTransitUrl(destination) {
  if (!destination) {
    return null;
  }
  const params = new URLSearchParams({ to: destination });
  return `https://transit.yahoo.co.jp/search/result?${params.toString()}`;
}

export function buildAirbnbUrl(destination, dateIso) {
  if (!destination) {
    return null;
  }
  const params = new URLSearchParams();
  if (dateIso) {
    const checkin = new Date(`${dateIso}T00:00:00`);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 2);
    params.set('checkin', checkin.toISOString().slice(0, 10));
    params.set('checkout', checkout.toISOString().slice(0, 10));
  }
  if (AIRBNB_AFFILIATE_ID) {
    params.set('af', AIRBNB_AFFILIATE_ID);
  }
  const query = params.toString();
  return `https://www.airbnb.com/s/${encodeURIComponent(destination)}/homes${query ? `?${query}` : ''}`;
}

export function buildFlightsUrl(destination) {
  if (!destination) {
    return null;
  }
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${destination}`)}`;
}

// Assembles only the shortcuts likely to actually matter for this
// specific plan -- gated on the same `difficulty` classification
// already computed for Free Time matching (see
// lib/digitalOpportunityLoss.js), not shown unconditionally. A local
// evening plan gets Maps + Calendar only; Airbnb/Flights only appear
// once the trip is big enough that lodging/flights are plausibly real
// decisions, not clutter.
export function getPlanShortcuts(plan, difficulty) {
  const destination = plan?.destination;
  const date = plan?.date;
  const travel = difficulty?.travelRequired;
  const isMultiDay = difficulty?.timeCommitment === 'multiDay';

  const shortcuts = [];
  const mapsUrl = buildMapsUrl(destination);
  if (mapsUrl) {
    shortcuts.push({ id: 'maps', label: 'Google Maps', icon: '🗺️', url: mapsUrl });
  }
  const calendarUrl = buildCalendarUrl({ title: destination, date, destination, schedule: plan?.schedule });
  if (calendarUrl) {
    shortcuts.push({ id: 'calendar', label: 'Add to Calendar', icon: '📅', url: calendarUrl });
  }
  if (destination && travel === 'domestic') {
    shortcuts.push({ id: 'transit', label: 'Train routes', icon: '🚆', url: buildTransitUrl(destination) });
  }
  if (destination && travel !== 'local' && isMultiDay) {
    shortcuts.push({ id: 'airbnb', label: 'Airbnb', icon: '🏠', url: buildAirbnbUrl(destination, date) });
  }
  if (destination && travel === 'international') {
    shortcuts.push({ id: 'flights', label: 'Flights', icon: '✈️', url: buildFlightsUrl(destination) });
  }
  return shortcuts;
}
