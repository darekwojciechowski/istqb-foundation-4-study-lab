export interface ExamTimerProps {
  remainingMs: number;
}

const WARNING_THRESHOLD_MS = 5 * 60_000;
const CRITICAL_THRESHOLD_MS = 60_000;

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Minimalist fixed-position countdown shown during an exam. Stays pinned on screen while
 * scrolling and shifts to warning/critical styling as time runs low. Per-second updates are
 * not announced (aria-live="off"); milestone announcements are handled by the parent.
 */
export function ExamTimer({ remainingMs }: ExamTimerProps) {
  const isCritical = remainingMs <= CRITICAL_THRESHOLD_MS;
  const isWarning = !isCritical && remainingMs <= WARNING_THRESHOLD_MS;
  const className = ['exam-timer', isWarning ? 'exam-timer--warning' : '', isCritical ? 'exam-timer--critical' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="timer" aria-label="Time remaining in exam" aria-live="off">
      <span className="exam-timer__icon" aria-hidden="true">
        ⏱
      </span>
      <span className="exam-timer__value">{formatRemaining(remainingMs)}</span>
    </div>
  );
}
