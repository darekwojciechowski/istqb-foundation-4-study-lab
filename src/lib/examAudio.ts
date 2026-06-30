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

export function playExamStart(): void {
  try {
    const ctx = new AudioContext();
    [523, 659, 784].forEach((freq, i) => playTone(ctx, freq, ctx.currentTime + i * 0.10, 0.18));
  } catch {
    // browser may block audio before user gesture — safe to ignore
  }
}

export function playExamEnd(): void {
  try {
    const ctx = new AudioContext();
    [784, 659, 523].forEach((freq, i) => playTone(ctx, freq, ctx.currentTime + i * 0.13, 0.20));
  } catch {
    // safe to ignore
  }
}
