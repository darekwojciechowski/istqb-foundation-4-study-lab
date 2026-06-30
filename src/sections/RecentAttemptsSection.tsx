import { CollapsiblePanel } from '../components/CollapsiblePanel';
import type { QuizAttempt } from '../lib/progress';

export interface RecentAttemptsSectionCopy {
  eyebrow: string;
  title: string;
}

export interface RecentAttemptsSectionProps {
  attempts: ReadonlyArray<QuizAttempt>;
  copy: RecentAttemptsSectionCopy;
}

export function RecentAttemptsSection({ attempts, copy }: RecentAttemptsSectionProps) {
  if (attempts.length === 0) {
    return null;
  }

  return (
    <CollapsiblePanel eyebrow={copy.eyebrow} title={copy.title}>
      <ol className="attempt-list" data-testid="attempt-list">
        {attempts.map((attempt) => (
          <li key={`${attempt.takenAt}-${attempt.mode}`}>
            {attempt.mode} - {attempt.correct}/{attempt.total} on {new Date(attempt.takenAt).toLocaleString()}
          </li>
        ))}
      </ol>
    </CollapsiblePanel>
  );
}
