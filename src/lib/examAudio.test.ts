import { afterEach, describe, expect, it, vi } from 'vitest';
import { playExamEnd, playExamStart } from './examAudio';

function makeMockAudioContext() {
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
  };
  return { ctx, oscillator, gainNode };
}

describe('examAudio', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('without AudioContext (jsdom default)', () => {
    it('playExamStart does not throw when AudioContext is unavailable', () => {
      expect(() => playExamStart()).not.toThrow();
    });

    it('playExamEnd does not throw when AudioContext is unavailable', () => {
      expect(() => playExamEnd()).not.toThrow();
    });
  });

  describe('with stubbed AudioContext', () => {
    it('playExamStart creates 3 oscillators and starts them', () => {
      const { ctx } = makeMockAudioContext();
      // Must use a regular function (not arrow) so `new AudioContext()` works as a constructor
      vi.stubGlobal('AudioContext', vi.fn(function () { return ctx; }));

      playExamStart();

      expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
      expect(ctx.createGain).toHaveBeenCalledTimes(3);
      const firstOsc = ctx.createOscillator.mock.results[0]?.value as ReturnType<typeof ctx.createOscillator>;
      expect(firstOsc.start).toHaveBeenCalledTimes(1);
      expect(firstOsc.stop).toHaveBeenCalledTimes(1);
    });

    it('playExamEnd creates 3 oscillators and starts them', () => {
      const { ctx } = makeMockAudioContext();
      vi.stubGlobal('AudioContext', vi.fn(function () { return ctx; }));

      playExamEnd();

      expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
      expect(ctx.createGain).toHaveBeenCalledTimes(3);
    });

    it('gain nodes are connected to destination', () => {
      const { ctx } = makeMockAudioContext();
      vi.stubGlobal('AudioContext', vi.fn(function () { return ctx; }));

      playExamStart();

      const gainNode = ctx.createGain.mock.results[0]?.value as ReturnType<typeof ctx.createGain>;
      expect(gainNode.connect).toHaveBeenCalledWith(ctx.destination);
    });
  });
});
