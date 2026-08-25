import { afterEach, describe, expect, it, vi } from 'vitest';
import { closeExamAudio, playExamEnd, playExamStart } from './examAudio';

function makeMockAudioContext(state: AudioContextState = 'running') {
  const oscillator = {
    type: 'sine' as OscillatorType,
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gainNode = {
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };
  const ctx = {
    createOscillator: vi.fn(() => ({ ...oscillator, connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    })),
    currentTime: 0,
    destination: {},
    state,
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
  return { ctx, oscillator, gainNode };
}

/** Stubs the constructor and hands back the spy, so construction counts are assertable. */
function stubAudioContext(ctx: ReturnType<typeof makeMockAudioContext>['ctx']) {
  // Must be a regular function (not an arrow) so `new AudioContext()` works as a constructor.
  const constructor = vi.fn(function () {
    return ctx;
  });
  vi.stubGlobal('AudioContext', constructor);
  return constructor;
}

describe('examAudio', () => {
  afterEach(() => {
    // The context is module-level state that outlives a single test, so release it
    // between tests. This is also the only coverage `closeExamAudio` needs.
    closeExamAudio();
    vi.unstubAllGlobals();
  });

  describe('when Web Audio is unavailable', () => {
    it('stays silent instead of throwing when Web Audio is unavailable at exam start', () => {
      expect(() => playExamStart()).not.toThrow();
    });

    it('stays silent instead of throwing when Web Audio is unavailable at exam end', () => {
      expect(() => playExamEnd()).not.toThrow();
    });
  });

  describe('when Web Audio is available', () => {
    it('plays a three-tone chime when an exam starts', () => {
      const { ctx } = makeMockAudioContext();
      stubAudioContext(ctx);

      playExamStart();

      expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
      expect(ctx.createGain).toHaveBeenCalledTimes(3);
      const firstOsc = ctx.createOscillator.mock.results[0]?.value as ReturnType<typeof ctx.createOscillator>;
      expect(firstOsc.start).toHaveBeenCalledTimes(1);
      expect(firstOsc.stop).toHaveBeenCalledTimes(1);
    });

    it('plays a three-tone chime when an exam ends', () => {
      const { ctx } = makeMockAudioContext();
      stubAudioContext(ctx);

      playExamEnd();

      expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
      expect(ctx.createGain).toHaveBeenCalledTimes(3);
    });

    it('routes every tone to the audio output', () => {
      const { ctx } = makeMockAudioContext();
      stubAudioContext(ctx);

      playExamStart();

      const gainNode = ctx.createGain.mock.results[0]?.value as ReturnType<typeof ctx.createGain>;
      expect(gainNode.connect).toHaveBeenCalledWith(ctx.destination);
    });

    // Browsers cap concurrent AudioContexts (Chrome at roughly six) and only release one
    // on close(), so a context per chime made every chime past the cap throw and go silent.
    it('reuses a single context across many exam start and end cycles', () => {
      const { ctx } = makeMockAudioContext();
      const constructor = stubAudioContext(ctx);

      for (let cycle = 0; cycle < 5; cycle += 1) {
        playExamStart();
        playExamEnd();
      }

      expect(constructor).toHaveBeenCalledTimes(1);
      expect(ctx.createOscillator).toHaveBeenCalledTimes(30);
    });

    it('resumes a context that the browser left suspended', () => {
      const { ctx } = makeMockAudioContext('suspended');
      stubAudioContext(ctx);

      playExamStart();

      expect(ctx.resume).toHaveBeenCalledTimes(1);
    });

    it('does not resume a context that is already running', () => {
      const { ctx } = makeMockAudioContext('running');
      stubAudioContext(ctx);

      playExamStart();

      expect(ctx.resume).not.toHaveBeenCalled();
    });

    it('plays again after audio is released for teardown', () => {
      const { ctx } = makeMockAudioContext();
      const constructor = stubAudioContext(ctx);

      playExamStart();
      closeExamAudio();
      playExamStart();

      expect(ctx.close).toHaveBeenCalledTimes(1);
      expect(constructor).toHaveBeenCalledTimes(2);
    });
  });
});
