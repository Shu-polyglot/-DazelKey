import { useRef } from 'react';

const DEFAULT_THRESHOLD_MS = 500;
const MOVE_CANCEL_PX = 10;

/*
  Press-and-hold, without fighting the ordinary tap it sits alongside.
  Returns pointer handlers to spread onto an element plus
  `consumeLongPress()`, which the element's own onClick should call
  first: it returns true (and resets) exactly when this click is the
  one following a long-press firing, so the caller can bail out of its
  normal tap behavior instead of running both. A press released before
  `threshold`, or dragged past `MOVE_CANCEL_PX` (a scroll/swipe passing
  through, not a hold), never fires at all -- its click runs untouched.
*/
export function useLongPress(onLongPress, { threshold = DEFAULT_THRESHOLD_MS } = {}) {
  const timerRef = useRef(null);
  const firedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onPointerDown(event) {
    firedRef.current = false;
    startRef.current = { x: event.clientX, y: event.clientY };
    clearTimer();
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress(event);
    }, threshold);
  }

  function onPointerMove(event) {
    if (!timerRef.current) {
      return;
    }
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      clearTimer();
    }
  }

  function consumeLongPress() {
    if (firedRef.current) {
      firedRef.current = false;
      return true;
    }
    return false;
  }

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: clearTimer,
      onPointerLeave: clearTimer,
      onPointerCancel: clearTimer,
      // A held press otherwise also opens the browser/OS's own context
      // menu (right-click, or a touch long-press's native menu) at the
      // same moment ours would show -- suppress that so only one shows.
      onContextMenu: (event) => event.preventDefault(),
    },
    consumeLongPress,
  };
}
