import { motion } from 'motion/react';
import { spring } from '../../styles/motion';
import './GoogleCalendarConnect.css';

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

/*
  The entry point for Free Time detection (see lib/googleCalendar) --
  a quiet, optional data connection alongside "About DazelKey" on
  Profile, not a primary header action, since most people will never
  need to touch it after the first connect. Once connected, its own
  free-evening count is just a confirmation that something real was
  read -- the actual use of that data is Weekly Nudge (WeeklyNudgeCard)
  picking a specific evening instead of a bare "this week".

  Receives its Google Calendar state as props from App.jsx's single
  useGoogleCalendar() call (same cross-cutting-hook pattern as
  buckets/profile) rather than calling the hook itself -- a second,
  independently-mounted instance here would fire its own silent
  reconnect + freeBusy fetch at the same moment as StrategyPage's own
  (both tab pages stay mounted simultaneously, see App.jsx), and two
  concurrent Google OAuth token requests from the same page turned out
  to race unreliably in testing.

  Returns null entirely when VITE_GOOGLE_CALENDAR_CLIENT_ID isn't set
  (see useGoogleCalendar's isAvailable) -- an unconfigured environment
  (e.g. a contributor's own .env.local without a Google Cloud project)
  should never show a button that can only ever fail.
*/
function GoogleCalendarConnect({ googleCalendar }) {
  const { isAvailable, status, freeEvenings, error, connect, disconnect } = googleCalendar;

  if (!isAvailable) {
    return null;
  }

  if (status === 'connected') {
    return (
      <div className="google-calendar-connect">
        <span className="google-calendar-connect-status">
          Google Calendar connected — {freeEvenings.length} free evening{freeEvenings.length === 1 ? '' : 's'} this week
        </span>
        <motion.button type="button" className="google-calendar-connect-link" onClick={disconnect} {...tapProps}>
          Disconnect
        </motion.button>
      </div>
    );
  }

  return (
    <div className="google-calendar-connect">
      <motion.button
        type="button"
        className="google-calendar-connect-link"
        onClick={() => connect('consent')}
        disabled={status === 'connecting'}
        {...tapProps}
      >
        {status === 'connecting' ? 'Connecting…' : 'Connect Google Calendar'}
      </motion.button>
      {status === 'error' && error && <span className="google-calendar-connect-error">{error}</span>}
    </div>
  );
}

export default GoogleCalendarConnect;
