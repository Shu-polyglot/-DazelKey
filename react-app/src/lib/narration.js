/*
  The one place that actually knows narration is done with the browser's
  SpeechSynthesis API. useNarration (see hooks/useNarration) only calls
  the three functions below -- speakParagraph, cancelSpeech,
  estimateDurationMs -- and never touches `window.speechSynthesis`
  itself. Swapping in pre-recorded audio files or a paid TTS service
  later means rewriting this file alone: keep the same three-function
  shape (start a paragraph, cancel whatever's in flight, estimate a
  paragraph's duration for the muted/unsupported fallback) and every
  caller keeps working unchanged.
*/

// A slow, deliberate reading pace -- noticeably calmer than
// SpeechSynthesis's ~180wpm default, matching the cinematic tone the
// rest of the opening/transition screens already use.
const RATE = 0.82;
const PITCH = 0.92;
const WORDS_PER_MINUTE_AT_RATE_1 = 180;

// The manifesto text is English, full stop -- without an explicit
// lang/voice, SpeechSynthesis falls back to whatever the device/browser
// is set to, which reads the English text in that locale's accent
// (e.g. a Japanese voice reading English words phonetically). Always
// stamping `en-US` on the utterance, and picking an actual English
// voice below, is what keeps this from drifting with the user's device
// language settings.
const LANG = 'en-US';

// Preferred by name, in order, when more than one English voice is
// available -- these are the natural-sounding ones on the platforms
// that ship them (Chrome/Android, macOS/iOS, Windows) rather than a
// robotic default. Matched by substring since browsers vary in exact
// naming ("Google US English" vs "Samantha" vs "Microsoft Aria Online
// (Natural) - English (United States)").
const PREFERRED_VOICE_NAMES = [
  'Google US English',
  'Samantha',
  'Daniel',
  'Microsoft Aria',
  'Microsoft Guy',
  'Alex',
];

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

// Used for the muted path and as a same-shape fallback when the API is
// unavailable -- so text still advances at roughly the pace it would
// have been narrated at, even with no audio actually playing.
export function estimateDurationMs(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wordsPerMinute = WORDS_PER_MINUTE_AT_RATE_1 * RATE;
  const minutes = words / wordsPerMinute;
  return Math.max(1400, Math.round(minutes * 60 * 1000));
}

let cachedVoices = null;
let voicesPromise = null;

// getVoices() often returns an empty array on the very first call --
// the voice list loads asynchronously and, per spec, fires
// `voiceschanged` once it's ready. Cached after the first successful
// load since the list doesn't change again during a session.
function loadVoices() {
  if (cachedVoices) {
    return Promise.resolve(cachedVoices);
  }
  if (voicesPromise) {
    return voicesPromise;
  }
  if (!isSpeechSupported()) {
    return Promise.resolve([]);
  }

  voicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const existing = synth.getVoices();
    if (existing.length > 0) {
      cachedVoices = existing;
      resolve(existing);
      return;
    }

    let settled = false;
    function finish(voices) {
      if (settled) {
        return;
      }
      settled = true;
      synth.removeEventListener('voiceschanged', handleVoicesChanged);
      clearTimeout(timeoutId);
      cachedVoices = voices;
      resolve(voices);
    }

    function handleVoicesChanged() {
      finish(synth.getVoices());
    }

    synth.addEventListener('voiceschanged', handleVoicesChanged);

    // Belt-and-suspenders: some engines (older WebKit in particular)
    // never fire voiceschanged even once voices are actually ready, so
    // fall back to whatever getVoices() reports after a short wait
    // rather than hanging forever with no narration at all.
    const timeoutId = setTimeout(() => finish(synth.getVoices()), 1000);
  });

  return voicesPromise;
}

function pickEnglishVoice(voices) {
  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('en'));
  if (englishVoices.length === 0) {
    return null;
  }

  for (const preferredName of PREFERRED_VOICE_NAMES) {
    const match = englishVoices.find((voice) => voice.name.includes(preferredName));
    if (match) {
      return match;
    }
  }

  return englishVoices.find((voice) => voice.lang === LANG) || englishVoices[0];
}

let activeUtterance = null;
// Bumped by cancelSpeech so a speakParagraph call still awaiting the
// voice list (see loadVoices) can tell it's been superseded and skip
// actually starting the utterance, instead of speaking late over
// whatever should have replaced it.
let speakGeneration = 0;

// Speaks exactly one paragraph and reports back through callbacks rather
// than a Promise -- SpeechSynthesisUtterance's onend/onerror already are
// callback-shaped, and useNarration needs to be able to cancel a
// paragraph mid-flight (see cancelSpeech), which a Promise can't do.
// Async internally only to wait out loadVoices() the first time it's
// called -- callers don't await it, they rely on onEnd/onError.
export async function speakParagraph(text, { onEnd, onError } = {}) {
  if (!isSpeechSupported()) {
    onError?.(new Error('SpeechSynthesis is not supported in this browser.'));
    return;
  }

  const generation = ++speakGeneration;
  const voices = await loadVoices();
  if (generation !== speakGeneration) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = RATE;
  utterance.pitch = PITCH;
  utterance.lang = LANG;

  const voice = pickEnglishVoice(voices);
  if (voice) {
    utterance.voice = voice;
    // Match the utterance's lang to the chosen voice's own lang (e.g.
    // en-GB) rather than forcing en-US against a voice that isn't --
    // mismatched voice/lang pairs are what some engines use to justify
    // falling back to a default voice instead.
    utterance.lang = voice.lang;
  }

  utterance.onend = () => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    onEnd?.();
  };
  utterance.onerror = (event) => {
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    onError?.(event);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  activeUtterance = null;
  speakGeneration += 1;
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}
