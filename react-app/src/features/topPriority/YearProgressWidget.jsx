import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getYearDayProgress, getMonthBoundaryPercentages, dateFromDayOfYear, formatShortDate } from '../../lib/dates';
import { transitions, spring } from '../../styles/motion';

// How often the widget re-reads the clock while mounted -- frequent
// enough that the fill visibly (if gently) creeps forward if someone
// lingers on this page, without re-rendering so often it costs anything
// or reads as a busy, ticking countdown rather than a calm ambient one.
const REFRESH_INTERVAL_MS = 60_000;

// How long a tapped/dragged date stays pinned above the bar before
// fading on its own -- long enough to actually read, short enough that
// it never feels like it's waiting on you to dismiss it.
const PIN_DISMISS_MS = 1_600;

const tapProps = {
  whileHover: { y: -1, transition: spring.hover },
  whileTap: { y: 1, scale: 0.96, transition: spring.press },
};

const captionVariants = {
  enter: { opacity: 0, y: -4 },
  center: { opacity: 1, y: 0, transition: transitions.standard },
  exit: { opacity: 0, y: 4, transition: transitions.exit },
};

function relativeDayLabel(dayOfYear, elapsedDays) {
  const diff = dayOfYear - elapsedDays;
  if (diff === 0) {
    return 'Today';
  }
  const count = Math.abs(diff);
  const noun = `day${count === 1 ? '' : 's'}`;
  return diff > 0 ? `${count} ${noun} from now` : `${count} ${noun} ago`;
}

/*
  Core page's own "20XX is Y% done." widget. Three things now make it
  read as time actually passing, and this year explorable, rather than
  a fixed snapshot taken once at load:
   - the fill's width uses sub-day precision (precisePercentage, see
     lib/dates) and re-reads the clock every REFRESH_INTERVAL_MS, so it
     visibly creeps forward the longer this page stays open. Motion
     tweens each step (transitions.emphasis) instead of snapping, so a
     refresh reads as a nudge forward, not a jump cut. The same tween
     also plays from `initial={{ width: 0 }}` on every fresh mount
     (every app launch, since this widget only exists while hasEntered
     -- see App.jsx), so the year's progress reads as growing into
     place rather than appearing already-filled.
   - the headline is "Day X of Y" -- a plain day count reads as time
     actually elapsing more directly than a percentage does ("2026 is
     0% done" at the start of the year says nothing). The percentage is
     still here, just demoted to the tappable caption below, which
     flips between "<year> is Y% done." and "N days left in <year>" --
     the same fact, either direction, a crossfade away.
   - pressing/dragging anywhere along the bar, or tapping a month tick,
     pins a small floating date (see pinDay state below) showing exactly
     what day that point in the year is and how far it sits from today
     -- an ephemeral "peek", not a persistent selection, so it fades on
     its own (PIN_DISMISS_MS) rather than needing a second tap to
     dismiss.
*/
function YearProgressWidget() {
  const [progress, setProgress] = useState(() => getYearDayProgress());
  const [showDaysLeft, setShowDaysLeft] = useState(false);
  // pinDay, once first set, is never cleared back to null -- it's the
  // last date shown, kept around so content stays put while isPinVisible
  // fades it out (see showPin). Not Motion/AnimatePresence-driven: this
  // one element never actually animated under Motion (a plain
  // motion.div, initial/animate, no exit-triggering surprises) reliably
  // in testing -- opacity got stuck at its `initial` value with zero
  // WAAPI animations ever registered on it, for reasons that didn't
  // trace back to anything in this file. A plain CSS transition on
  // .is-visible sidesteps whatever that was; duration/easing below are
  // still read from styles/motion's own tokens, just applied as CSS
  // instead of a Motion prop.
  const [pinDay, setPinDay] = useState(null);
  const [isPinVisible, setIsPinVisible] = useState(false);

  const trackRef = useRef(null);
  const dismissTimerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setProgress(getYearDayProgress()), REFRESH_INTERVAL_MS);
    // Backgrounded tabs throttle setInterval (browsers cap or pause timers
    // once document.hidden is true), so the fill can sit stale for however
    // long this tab was in the background -- catch it up the instant
    // someone actually looks at it again instead of waiting on whatever's
    // left of the throttled interval.
    function handleVisibilityChange() {
      if (!document.hidden) {
        setProgress(getYearDayProgress());
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => () => clearTimeout(dismissTimerRef.current), []);

  const { year, totalDays, elapsedDays, percentage, precisePercentage } = progress;
  const daysLeft = totalDays - elapsedDays;
  const monthBoundaries = getMonthBoundaryPercentages(year, totalDays);

  // Shared by both interactions below -- a tap on a tick knows its exact
  // day-of-year already; a press/drag on the bar has to derive one from
  // a pixel position. Either way, showing it resets the same dismiss
  // timer so a fresh tap/drag is never cut short by one a previous
  // interaction already started.
  function showPin(dayOfYear) {
    clearTimeout(dismissTimerRef.current);
    setPinDay(dayOfYear);
    setIsPinVisible(true);
    dismissTimerRef.current = setTimeout(() => setIsPinVisible(false), PIN_DISMISS_MS);
  }

  function dayFromClientX(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.min(totalDays, Math.max(1, Math.round(fraction * totalDays)));
  }

  function handleTrackPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    showPin(dayFromClientX(event.clientX));
  }

  function handleTrackPointerMove(event) {
    // buttons is a bitmask, 0 when nothing is pressed -- without this
    // check, a plain hover (no press) would start scrubbing too.
    if (event.buttons === 0) {
      return;
    }
    showPin(dayFromClientX(event.clientX));
  }

  // Defaults so this renders (invisible, opacity 0 by default in CSS)
  // from the very first paint, before pinDay is ever set -- a CSS
  // transition only plays on a class change to an *already-mounted*
  // node, so the pin has to already exist the first time showPin flips
  // isPinVisible true, not be freshly created in that same render.
  const pinPercent = pinDay != null ? ((pinDay - 1) / totalDays) * 100 : 0;

  return (
    <div className="year-progress-widget">
      <div className="year-progress-header">
        <p className="year-progress-heading">
          Day {elapsedDays} of {totalDays}
        </p>
        <motion.button
          type="button"
          className="year-progress-caption"
          onClick={() => setShowDaysLeft((prev) => !prev)}
          aria-label={showDaysLeft ? 'Show percent done instead' : 'Show days remaining this year instead'}
          {...tapProps}
        >
          <AnimatePresence mode="wait" initial={false}>
            {showDaysLeft ? (
              <motion.span key="left" variants={captionVariants} initial="enter" animate="center" exit="exit">
                {daysLeft} day{daysLeft === 1 ? '' : 's'} left in {year}
              </motion.span>
            ) : (
              <motion.span key="percent" variants={captionVariants} initial="enter" animate="center" exit="exit">
                {year} is {percentage}% done.
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="year-progress-bar-wrap">
        <div className="year-progress-pin-anchor" style={{ left: `${pinPercent}%` }}>
          <div
            className={`year-progress-pin${isPinVisible ? ' is-visible' : ''}`}
            style={{
              transitionDuration: `${transitions.micro.duration}s`,
              transitionTimingFunction: `cubic-bezier(${transitions.micro.ease.join(',')})`,
            }}
          >
            {pinDay != null && (
              <>
                <span className="year-progress-pin-date">{formatShortDate(dateFromDayOfYear(year, pinDay))}</span>
                <span className="year-progress-pin-relative">{relativeDayLabel(pinDay, elapsedDays)}</span>
              </>
            )}
          </div>
        </div>

        <div
          className="year-progress-bar-track"
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
        >
          <motion.div
            className="year-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${precisePercentage}%` }}
            transition={transitions.emphasis}
          />
          <div className="year-progress-bar-ticks" aria-hidden="true">
            {monthBoundaries.map((boundary) => (
              <span key={boundary.month} className="year-progress-bar-tick" style={{ left: `${boundary.percent}%` }} />
            ))}
          </div>
          {monthBoundaries.map((boundary) => (
            <button
              key={boundary.month}
              type="button"
              className="year-progress-tick-target"
              style={{ left: `${boundary.percent}%` }}
              aria-label={`Jump to ${formatShortDate(dateFromDayOfYear(year, boundary.dayOfYear))}`}
              // Stops the press from also bubbling up into the track's
              // own pointerdown handler above, which would otherwise
              // immediately overwrite this tick's exact day with an
              // approximate one derived from the same pixel position.
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => showPin(boundary.dayOfYear)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default YearProgressWidget;
