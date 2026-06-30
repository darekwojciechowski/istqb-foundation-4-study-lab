import { useEffect, useRef, useState } from 'react';

export interface UseExamTimerOptions {
  /** Whether the countdown should be running (exam in progress and not yet submitted). */
  active: boolean;
  /** Total exam duration in milliseconds. */
  durationMs: number;
  /** Changing this value while active restarts the countdown (e.g. a new exam seed). */
  resetKey: string;
  /** Called exactly once when the countdown reaches zero. */
  onExpire: () => void;
  /** Milestone thresholds in ms. Fires onMilestone once each when remainingMs first drops below that threshold. */
  milestoneMs?: ReadonlyArray<number>;
  /** Called once per milestone when remainingMs first crosses below that threshold. */
  onMilestone?: (milestoneMs: number) => void;
}

export interface UseExamTimerResult {
  remainingMs: number;
  isRunning: boolean;
}

const TICK_INTERVAL_MS = 250;

/**
 * Deadline-based countdown for the exam simulator. Stores an absolute deadline so the
 * remaining time stays accurate even if the browser throttles the interval, and fires
 * {@link UseExamTimerOptions.onExpire} a single time when the clock hits zero.
 */
export function useExamTimer({ active, durationMs, resetKey, onExpire, milestoneMs, onMilestone }: UseExamTimerOptions): UseExamTimerResult {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const onMilestoneRef = useRef(onMilestone);
  const milestonesMsRef = useRef(milestoneMs);
  const announcedMilestonesRef = useRef<Set<number>>(new Set());

  // Keep the latest callbacks and config without restarting the countdown.
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onMilestoneRef.current = onMilestone;
  }, [onMilestone]);

  useEffect(() => {
    milestonesMsRef.current = milestoneMs;
  }, [milestoneMs]);

  useEffect(() => {
    if (!active) {
      expiredRef.current = false;
      announcedMilestonesRef.current = new Set();
      setRemainingMs(durationMs);
      return;
    }

    // Start (or restart on resetKey change) a fresh countdown.
    const deadline = Date.now() + durationMs;
    expiredRef.current = false;
    announcedMilestonesRef.current = new Set();
    setRemainingMs(durationMs);

    const intervalId = window.setInterval(() => {
      const next = Math.max(0, deadline - Date.now());
      setRemainingMs(next);

      if (onMilestoneRef.current && milestonesMsRef.current) {
        for (const milestone of milestonesMsRef.current) {
          if (next <= milestone && !announcedMilestonesRef.current.has(milestone)) {
            announcedMilestonesRef.current.add(milestone);
            onMilestoneRef.current(milestone);
          }
        }
      }

      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        window.clearInterval(intervalId);
        onExpireRef.current();
      }
    }, TICK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [active, durationMs, resetKey]);

  return { remainingMs, isRunning: active && remainingMs > 0 };
}
