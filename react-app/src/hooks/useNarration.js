import { useCallback, useEffect, useRef, useState } from 'react';
import { cancelSpeech, estimateDurationMs, isSpeechSupported, speakParagraph } from '../lib/narration';

/*
  Advances through a list of paragraphs one at a time, narrating each
  with lib/narration's speakParagraph and moving to the next only once
  that paragraph actually finishes -- so the visible paragraph and the
  spoken one are always the same one, no separate word-level sync logic
  needed. Muted (or when SpeechSynthesis isn't supported at all) falls
  back to lib/narration's estimateDurationMs on a plain timer, so the
  text still advances at roughly a narrator's pace with no audio.

  Deliberately knows nothing about `window.speechSynthesis` itself --
  see lib/narration's own header comment for why that boundary exists.
*/
export function useNarration(paragraphs) {
  const [index, setIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const indexRef = useRef(-1);
  const isMutedRef = useRef(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const runParagraph = useCallback(
    (i) => {
      const text = paragraphs[i];
      if (isMutedRef.current || !isSpeechSupported()) {
        timerRef.current = setTimeout(advanceRef.current, estimateDurationMs(text));
        return;
      }
      speakParagraph(text, {
        onEnd: () => advanceRef.current(),
        // A voice/engine hiccup shouldn't strand the screen mid-manifesto --
        // fall back to the same estimated timer the muted path uses.
        onError: () => {
          timerRef.current = setTimeout(advanceRef.current, estimateDurationMs(text));
        },
      });
    },
    [paragraphs],
  );

  const advance = useCallback(() => {
    const next = indexRef.current + 1;
    indexRef.current = next;
    if (next >= paragraphs.length) {
      setIndex(next);
      setIsFinished(true);
      return;
    }
    setIndex(next);
    runParagraph(next);
  }, [paragraphs, runParagraph]);

  // advance/runParagraph call each other (advance -> runParagraph ->
  // schedules a callback that calls advance again) -- a ref sidesteps
  // needing them declared in a single circular useCallback.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  const start = useCallback(() => {
    cancelSpeech();
    clearTimer();
    indexRef.current = -1;
    setIsFinished(false);
    advanceRef.current();
  }, [clearTimer]);

  const stop = useCallback(() => {
    cancelSpeech();
    clearTimer();
  }, [clearTimer]);

  // Just the flip -- the actual re-entry into the current paragraph
  // happens in the effect below, not here. React (in development, under
  // StrictMode) calls a functional setState updater twice to check it's
  // pure; a real side effect like re-entering a paragraph living inside
  // that updater ran twice per click as a result -- double-advancing the
  // narration on every mute toggle. An effect keyed on `isMuted` doesn't
  // have that problem: StrictMode only double-invokes effects around a
  // component's initial mount (to catch missing cleanup), not on every
  // dependency change thereafter, and the guard below is a no-op at that
  // initial mount anyway since playback hasn't started yet.
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (indexRef.current < 0 || indexRef.current >= paragraphs.length) {
      return;
    }
    // Re-enter the current paragraph under the new mode rather than
    // trying to resume mid-utterance (SpeechSynthesis has no reliable
    // cross-browser way to change an in-flight utterance's volume) --
    // the visible paragraph doesn't change, only how its remaining time
    // is tracked.
    cancelSpeech();
    clearTimer();
    runParagraph(indexRef.current);
  }, [isMuted, paragraphs, runParagraph, clearTimer]);

  useEffect(() => stop, [stop]);

  return {
    index,
    currentParagraph: index >= 0 && index < paragraphs.length ? paragraphs[index] : null,
    isMuted,
    isFinished,
    start,
    stop,
    toggleMute,
  };
}
