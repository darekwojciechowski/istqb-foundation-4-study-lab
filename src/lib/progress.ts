import type { ChapterId } from './quiz';
import { gradeCard, getCardState, sanitizeCardStates, type CardGrade, type CardStates } from './srs';

export type QuizAttempt =
  | { mode: 'practice'; correct: number; total: number; takenAt: string }
  | { mode: 'exam'; correct: number; total: number; takenAt: string };

export interface LearnerProgress<TChapterId extends string = string> {
  packId?: string;
  schemaVersion?: number;
  completedChapterIds: ChapterId<TChapterId>[];
  quizAttempts: QuizAttempt[];
  /** Calendar-free flashcard mastery boxes, keyed by flashcard id. No timestamps. */
  cardStates: CardStates;
  lastStudiedAt?: string;
}

export interface ProgressMetadata {
  packId: string;
  schemaVersion: number;
}

export interface SanitizeProgressOptions<TChapterId extends string = string> extends ProgressMetadata {
  validChapterIds: Iterable<ChapterId<TChapterId>>;
}

interface ReadableStorage {
  getItem(key: string): string | null;
}

export interface WritableStorage extends ReadableStorage {
  setItem(key: string, value: string): void;
}

const DEFAULT_STORAGE_KEY = 'study-lab-progress';
const MAX_ATTEMPTS = 5;

export function createDefaultProgress<TChapterId extends string = string>(
  metadata?: ProgressMetadata,
): LearnerProgress<TChapterId> {
  return {
    packId: metadata?.packId,
    schemaVersion: metadata?.schemaVersion,
    completedChapterIds: [],
    quizAttempts: [],
    cardStates: {},
    lastStudiedAt: undefined,
  };
}

// Records a flashcard self-grade. Deliberately writes no date: flashcard "spacing"
// is tracked in cards seen (see lib/srs), never wall-clock time.
export function recordCardGrade<TChapterId extends string = string>(
  progress: LearnerProgress<TChapterId>,
  cardId: string,
  grade: CardGrade,
): LearnerProgress<TChapterId> {
  return {
    ...progress,
    cardStates: {
      ...progress.cardStates,
      [cardId]: gradeCard(getCardState(progress.cardStates, cardId), grade),
    },
  };
}

export function toggleChapterComplete<TChapterId extends string = string>(
  progress: LearnerProgress<TChapterId>,
  chapterId: ChapterId<TChapterId>,
  studiedAt = new Date().toISOString(),
): LearnerProgress<TChapterId> {
  const isCompleted = progress.completedChapterIds.includes(chapterId);

  return {
    ...progress,
    completedChapterIds: isCompleted
      ? progress.completedChapterIds.filter((completedChapterId) => completedChapterId !== chapterId)
      : [...progress.completedChapterIds, chapterId],
    lastStudiedAt: studiedAt,
  };
}

export function recordQuizResult<TChapterId extends string = string>(
  progress: LearnerProgress<TChapterId>,
  attempt: QuizAttempt,
): LearnerProgress<TChapterId> {
  return {
    ...progress,
    quizAttempts: [attempt, ...progress.quizAttempts].slice(0, MAX_ATTEMPTS),
    lastStudiedAt: attempt.takenAt,
  };
}

export function sanitizeProgress<TChapterId extends string = string>(
  progress: LearnerProgress<TChapterId>,
  options: SanitizeProgressOptions<TChapterId>,
): LearnerProgress<TChapterId> {
  const metadata = {
    packId: options.packId,
    schemaVersion: options.schemaVersion,
  };

  if (progress.packId !== options.packId || progress.schemaVersion !== options.schemaVersion) {
    return createDefaultProgress<TChapterId>(metadata);
  }

  const validChapterIds = new Set(options.validChapterIds);
  const completedChapterIds = progress.completedChapterIds.filter((chapterId) => validChapterIds.has(chapterId));
  const quizAttempts = progress.quizAttempts.filter(isValidQuizAttempt).slice(0, MAX_ATTEMPTS);
  const cardStates = sanitizeCardStates(progress.cardStates);
  const lastStudiedAt = isValidDateString(progress.lastStudiedAt) ? progress.lastStudiedAt : undefined;

  return {
    ...metadata,
    completedChapterIds,
    quizAttempts,
    cardStates,
    lastStudiedAt,
  };
}

export function loadProgress<TChapterId extends string = string>(
  storage: ReadableStorage,
  storageKey = DEFAULT_STORAGE_KEY,
): LearnerProgress<TChapterId> {
  try {
    const savedProgress = storage.getItem(storageKey);

    if (!savedProgress) {
      return createDefaultProgress<TChapterId>();
    }

    const parsedProgress = JSON.parse(savedProgress) as Partial<LearnerProgress<TChapterId>>;

    if (!Array.isArray(parsedProgress.completedChapterIds) || !Array.isArray(parsedProgress.quizAttempts)) {
      return createDefaultProgress<TChapterId>();
    }

    return {
      packId: parsedProgress.packId,
      schemaVersion: parsedProgress.schemaVersion,
      completedChapterIds: parsedProgress.completedChapterIds as ChapterId<TChapterId>[],
      quizAttempts: parsedProgress.quizAttempts as QuizAttempt[],
      cardStates: sanitizeCardStates(parsedProgress.cardStates),
      lastStudiedAt: parsedProgress.lastStudiedAt,
    };
  } catch {
    return createDefaultProgress<TChapterId>();
  }
}

export function saveProgress<TChapterId extends string = string>(
  progress: LearnerProgress<TChapterId>,
  storage: WritableStorage,
  storageKey = DEFAULT_STORAGE_KEY,
): void {
  try {
    storage.setItem(storageKey, JSON.stringify(progress));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      return;
    }
    throw error;
  }
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: unknown }).name === 'QuotaExceededError'
  );
}

// Trust boundary: parses untrusted JSON from localStorage. All field
// validation for QuizAttempt happens here; downstream code may assume
// the discriminated union holds.
function isValidQuizAttempt(attempt: unknown): attempt is QuizAttempt {
  if (attempt === null || typeof attempt !== 'object') {
    return false;
  }

  const candidate = attempt as { mode?: unknown };

  switch (candidate.mode) {
    case 'practice':
    case 'exam':
      return isValidAttemptShape(attempt as Record<string, unknown>);
    default:
      return false;
  }
}

function isValidAttemptShape(candidate: Record<string, unknown>): boolean {
  const { correct, total, takenAt } = candidate;
  return (
    typeof correct === 'number' &&
    typeof total === 'number' &&
    Number.isInteger(correct) &&
    Number.isInteger(total) &&
    correct >= 0 &&
    total > 0 &&
    correct <= total &&
    isValidDateString(takenAt)
  );
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
