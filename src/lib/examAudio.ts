/**
 * One `AudioContext` for the app's lifetime.
 *
 * Browsers cap concurrent contexts — Chrome allows about six — and a context is only
 * released by `close()`. Constructing one per chime therefore exhausted the pool after a
 * handful of exam start/end cycles, after which every later construction threw and no
 * chime played again for the rest of the session.
 */
let sharedContext: AudioContext | null = null;

/**
 * Returns the shared context, creating it on first use, or `null` where Web Audio is
 * unavailable.
 */
function acquireContext(): AudioContext | null {
  try {
    sharedContext ??= new AudioContext();

    // Created outside a user gesture, a context starts `suspended`: it does not throw,
    // it simply plays nothing. Resuming is what actually makes the chime audible, and a
    // rejected resume (autoplay policy) leaves the app in exactly the state it would
    // have been in anyway — silent.
    if (sharedContext.state === 'suspended') {
      void sharedContext.resume().catch(() => undefined);
    }

    return sharedContext;
  } catch {
    // No Web Audio in this environment — under jsdom `AudioContext` is not defined at
    // all, so the reference itself throws. Silence is the right fallback for a
    // decorative chime.
    return null;
  }
}

/** Releases the shared context. For teardown — tests, or a future unmount path. */
export function closeExamAudio(): void {
  const context = sharedContext;
  sharedContext = null;

  try {
    void context?.close();
  } catch {
    // Already closed, or never really open. Nothing left to release either way.
  }
}

function playTone(ctx: AudioContext, freq: number, startAt: number, duration: number, gain = 0.18): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, startAt);
  g.gain.exponentialRampToValueAtTime(0.001, startAt + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration);
}

/** Plays an ascending or descending run of tones, or nothing at all if audio is unavailable. */
function playChime(frequencies: ReadonlyArray<number>, spacing: number, duration: number): void {
  const ctx = acquireContext();
  if (!ctx) {
    return;
  }

  try {
    frequencies.forEach((freq, i) => playTone(ctx, freq, ctx.currentTime + i * spacing, duration));
  } catch {
    // A decorative chime must never take the quiz down with it.
  }
}

export function playExamStart(): void {
  playChime([523, 659, 784], 0.10, 0.18);
}

export function playExamEnd(): void {
  playChime([784, 659, 523], 0.13, 0.20);
}
