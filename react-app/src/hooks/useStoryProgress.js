import { useEffect, useRef } from 'react';
import { animate, useMotionValue } from 'motion/react';

/*
  Drives one Story's progress segment (0 -> 1) on a linear timer, restarting
  fresh whenever `storyKey` changes. Pause stops the tween in place; resume
  continues from wherever it left off rather than restarting, so a long
  press never costs the user their place in the current Story.
*/
export function useStoryProgress({ storyKey, duration, enabled, onComplete }) {
  const progress = useMotionValue(0);
  const controlsRef = useRef(null);
  const isPausedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  function play(from) {
    controlsRef.current?.stop();
    if (!enabled || !Number.isFinite(duration)) {
      return;
    }
    const remainingMs = duration * (1 - from);
    controlsRef.current = animate(progress, 1, {
      duration: Math.max(remainingMs, 0) / 1000,
      ease: 'linear',
      onComplete: () => onCompleteRef.current?.(),
    });
  }

  function pause() {
    isPausedRef.current = true;
    controlsRef.current?.stop();
  }

  function resume() {
    if (!isPausedRef.current) {
      return;
    }
    isPausedRef.current = false;
    play(progress.get());
  }

  useEffect(() => {
    progress.set(0);
    isPausedRef.current = false;
    play(0);
    return () => controlsRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyKey, duration, enabled]);

  return { progress, pause, resume };
}
