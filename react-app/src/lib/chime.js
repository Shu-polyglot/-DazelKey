// A single shared AudioContext, created lazily on the first tap (Safari/iOS
// won't let audio start before a user gesture, and browsers cap how many
// contexts can exist at once) -- every subsequent chime reuses it instead of
// spinning up a new one.
let sharedContext = null;

// The reverb's ConvolverNode + impulse response buffer are expensive to
// build, so they're created once on first use and reused for every chime
// after that. Wired straight to the destination here, so callers only ever
// need to connect a wet gain *into* it.
let sharedConvolver = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedContext) {
    sharedContext = new AudioContextClass();
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume();
  }
  return sharedContext;
}

// A pseudo water-surface impulse response: ~1.2s of white noise per channel,
// shaped by a (1 - t)^2.5 decay curve so the tail thins out fast at first
// and lingers faintly toward the end, like a ripple spreading and fading.
function createImpulseResponse(ctx) {
  const duration = 1.2;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      const decay = (1 - t) ** 2.5;
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }

  return buffer;
}

function getConvolver(ctx) {
  if (!sharedConvolver) {
    sharedConvolver = ctx.createConvolver();
    sharedConvolver.buffer = createImpulseResponse(ctx);
    sharedConvolver.connect(ctx.destination);
  }
  return sharedConvolver;
}

// One xylophone-bar partial: a sine oscillator with its own decay envelope,
// split into a dry path (straight to the speakers) and a wet path (through
// the shared reverb) so it gets its share of the water-like tail.
function playPartial(ctx, convolver, frequency, gainStart, decaySeconds, stopSeconds) {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, now);

  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(gainStart, now);
  envelope.gain.exponentialRampToValueAtTime(0.001, now + decaySeconds);

  const dry = ctx.createGain();
  dry.gain.value = 0.5;
  const wet = ctx.createGain();
  wet.gain.value = 0.55;

  osc.connect(envelope);
  envelope.connect(dry);
  envelope.connect(wet);
  dry.connect(ctx.destination);
  wet.connect(convolver);

  osc.start(now);
  osc.stop(now + stopSeconds);
}

// A short xylophone-like "pon" -- a sine fundamental plus a fast-decaying
// overtone at 3.93x the fundamental (a xylophone bar's characteristic
// inharmonic partial), both routed through a shared reverb so the note
// blooms out and fades like a ripple spreading across water.
export function playTapChime(frequency = 1046.5) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const convolver = getConvolver(ctx);
  playPartial(ctx, convolver, frequency, 0.3, 1.1, 1.2);
  playPartial(ctx, convolver, frequency * 3.93, 0.12, 0.1, 0.12);
}
