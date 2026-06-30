import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExamTimer } from './useExamTimer';

const DURATION_MS = 60_000;

describe('useExamTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down while active', () => {
    const { result } = renderHook(() =>
      useExamTimer({ active: true, durationMs: DURATION_MS, resetKey: 'seed-1', onExpire: vi.fn() }),
    );

    expect(result.current.remainingMs).toBe(DURATION_MS);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.remainingMs).toBeLessThanOrEqual(50_000);
    expect(result.current.remainingMs).toBeGreaterThan(0);
  });

  it('fires onExpire exactly once when the countdown reaches zero', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useExamTimer({ active: true, durationMs: DURATION_MS, resetKey: 'seed-1', onExpire }),
    );

    act(() => {
      vi.advanceTimersByTime(DURATION_MS + 1_000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(result.current.remainingMs).toBe(0);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does not count down or expire when inactive', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useExamTimer({ active: false, durationMs: DURATION_MS, resetKey: 'seed-1', onExpire }),
    );

    act(() => {
      vi.advanceTimersByTime(DURATION_MS + 5_000);
    });

    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current.remainingMs).toBe(DURATION_MS);
  });

  it('fires onMilestone once when remainingMs first drops at or below the threshold', () => {
    const onMilestone = vi.fn();
    renderHook(() =>
      useExamTimer({
        active: true,
        durationMs: DURATION_MS,
        resetKey: 'seed-1',
        onExpire: vi.fn(),
        milestoneMs: [5_000],
        onMilestone,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(DURATION_MS - 5_000 + 500);
    });

    expect(onMilestone).toHaveBeenCalledTimes(1);
    expect(onMilestone).toHaveBeenCalledWith(5_000);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(onMilestone).toHaveBeenCalledTimes(1);
  });

  it('fires two milestones once each in order with no double-firing', () => {
    const onMilestone = vi.fn();
    const DURATION = 10 * 60_000;

    renderHook(() =>
      useExamTimer({
        active: true,
        durationMs: DURATION,
        resetKey: 'ms-multi',
        onExpire: vi.fn(),
        milestoneMs: [5 * 60_000, 60_000],
        onMilestone,
      }),
    );

    // Advance past 5-minute threshold
    act(() => {
      vi.advanceTimersByTime(5 * 60_000 + 250);
    });
    expect(onMilestone).toHaveBeenCalledTimes(1);
    expect(onMilestone).toHaveBeenLastCalledWith(5 * 60_000);

    // Advance past 1-minute threshold
    act(() => {
      vi.advanceTimersByTime(4 * 60_000);
    });
    expect(onMilestone).toHaveBeenCalledTimes(2);
    expect(onMilestone).toHaveBeenLastCalledWith(60_000);

    // Advance further — no additional firings
    act(() => {
      vi.advanceTimersByTime(60_000 + 500);
    });
    expect(onMilestone).toHaveBeenCalledTimes(2);
  });

  it('resets announced milestones when the resetKey changes', () => {
    const onMilestone = vi.fn();
    const DURATION = 60_000;
    const MILESTONE = 5_000;

    const { rerender } = renderHook(
      ({ resetKey }) =>
        useExamTimer({
          active: true,
          durationMs: DURATION,
          resetKey,
          onExpire: vi.fn(),
          milestoneMs: [MILESTONE],
          onMilestone,
        }),
      { initialProps: { resetKey: 'key-1' } },
    );

    act(() => {
      vi.advanceTimersByTime(DURATION - MILESTONE + 250);
    });
    expect(onMilestone).toHaveBeenCalledTimes(1);

    rerender({ resetKey: 'key-2' });

    act(() => {
      vi.advanceTimersByTime(DURATION - MILESTONE + 250);
    });
    expect(onMilestone).toHaveBeenCalledTimes(2);
  });

  it('fires milestone before expire and expire exactly once in the same countdown', () => {
    const onMilestone = vi.fn();
    const onExpire = vi.fn();
    const DURATION = 10_000;
    const MILESTONE = 3_000;

    renderHook(() =>
      useExamTimer({
        active: true,
        durationMs: DURATION,
        resetKey: 'interplay',
        onExpire,
        milestoneMs: [MILESTONE],
        onMilestone,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(DURATION - MILESTONE + 250);
    });
    expect(onMilestone).toHaveBeenCalledTimes(1);
    expect(onExpire).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(MILESTONE + 500);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('invokes the latest onExpire ref without restarting the countdown on callback change', () => {
    const fnA = vi.fn();
    const fnB = vi.fn();
    const DURATION = 10_000;

    const { rerender, result } = renderHook(
      ({ onExpire }: { onExpire: () => void }) =>
        useExamTimer({ active: true, durationMs: DURATION, resetKey: 'ref-expire', onExpire }),
      { initialProps: { onExpire: fnA } },
    );

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    const msBefore = result.current.remainingMs;
    expect(msBefore).toBeLessThan(DURATION);

    rerender({ onExpire: fnB });

    // Countdown must not have reset to DURATION
    expect(result.current.remainingMs).toBeLessThanOrEqual(msBefore);

    act(() => {
      vi.advanceTimersByTime(DURATION);
    });
    expect(fnA).not.toHaveBeenCalled();
    expect(fnB).toHaveBeenCalledTimes(1);
  });

  it('invokes the latest onMilestone ref without restarting the countdown on callback change', () => {
    const milA = vi.fn();
    const milB = vi.fn();
    const DURATION = 60_000;
    const MILESTONE = 5_000;

    const { rerender } = renderHook(
      ({ onMilestone }: { onMilestone: (ms: number) => void }) =>
        useExamTimer({
          active: true,
          durationMs: DURATION,
          resetKey: 'ref-milestone',
          onExpire: vi.fn(),
          milestoneMs: [MILESTONE],
          onMilestone,
        }),
      { initialProps: { onMilestone: milA } },
    );

    // Advance to just before the milestone
    act(() => {
      vi.advanceTimersByTime(DURATION - MILESTONE - 1_000);
    });

    rerender({ onMilestone: milB });

    // Advance past the milestone
    act(() => {
      vi.advanceTimersByTime(1_250);
    });
    expect(milA).not.toHaveBeenCalled();
    expect(milB).toHaveBeenCalledTimes(1);
    expect(milB).toHaveBeenCalledWith(MILESTONE);
  });

  it('restarts the countdown when the resetKey changes', () => {
    const { result, rerender } = renderHook(
      ({ resetKey }) => useExamTimer({ active: true, durationMs: DURATION_MS, resetKey, onExpire: vi.fn() }),
      { initialProps: { resetKey: 'seed-1' } },
    );

    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.remainingMs).toBeLessThanOrEqual(30_000);

    rerender({ resetKey: 'seed-2' });

    expect(result.current.remainingMs).toBe(DURATION_MS);
  });
});
