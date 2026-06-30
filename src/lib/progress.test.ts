import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createDefaultProgress,
  loadProgress,
  recordCardGrade,
  recordQuizResult,
  sanitizeProgress,
  saveProgress,
  toggleChapterComplete,
  type LearnerProgress,
} from './progress';

describe('createDefaultProgress', () => {
  it('starts with no completed chapters and no quiz attempts', () => {
    expect(createDefaultProgress()).toEqual({
      completedChapterIds: [],
      quizAttempts: [],
      cardStates: {},
      lastStudiedAt: undefined,
    });
  });
});

describe('recordCardGrade', () => {
  it('advances a card box without writing any date field', () => {
    const progress = createDefaultProgress();
    const graded = recordCardGrade(progress, 'flash-1', 'good');

    expect(graded.cardStates['flash-1']).toEqual({ box: 1, seen: 1 });
    expect(graded.lastStudiedAt).toBeUndefined();
  });

  it('accumulates grades across repeated reviews of the same card', () => {
    const first = recordCardGrade(createDefaultProgress(), 'flash-1', 'easy');
    const second = recordCardGrade(first, 'flash-1', 'good');

    expect(second.cardStates['flash-1']).toEqual({ box: 3, seen: 2 });
  });
});

describe('toggleChapterComplete', () => {
  it('adds an incomplete chapter and removes a completed chapter', () => {
    const progress = createDefaultProgress();
    const completed = toggleChapterComplete(progress, 'fundamentals', '2026-05-12T08:00:00.000Z');
    const incomplete = toggleChapterComplete(completed, 'fundamentals', '2026-05-12T08:05:00.000Z');

    expect(completed.completedChapterIds).toEqual(['fundamentals']);
    expect(incomplete.completedChapterIds).toEqual([]);
    expect(incomplete.lastStudiedAt).toBe('2026-05-12T08:05:00.000Z');
  });

  it('preserves narrowed chapter-id unions in generic progress helpers', () => {
    type PackChapterId = 'fundamentals' | 'sdlc';
    const progress = createDefaultProgress<PackChapterId>();
    const completed = toggleChapterComplete(progress, 'fundamentals', '2026-05-12T08:00:00.000Z');
    const withSecondChapter = toggleChapterComplete(completed, 'sdlc', '2026-05-12T08:05:00.000Z');

    expect(completed.completedChapterIds).toEqual(['fundamentals']);
    expect(withSecondChapter.completedChapterIds).toEqual(['fundamentals', 'sdlc']);
    expectTypeOf(withSecondChapter.completedChapterIds).toEqualTypeOf<PackChapterId[]>();
  });
});

describe('recordQuizResult', () => {
  it('keeps the newest attempt first and limits history to five attempts', () => {
    const progress = createDefaultProgress();
    const attempts = Array.from({ length: 6 }, (_, index) => index + 1).reduce<LearnerProgress>(
      (currentProgress, score) =>
        recordQuizResult(currentProgress, {
          mode: 'practice',
          correct: score,
          total: 10,
          takenAt: `2026-05-12T08:0${score}:00.000Z`,
        }),
      progress,
    );

    expect(attempts.quizAttempts).toHaveLength(5);
    expect(attempts.quizAttempts[0]).toEqual({
      mode: 'practice',
      correct: 6,
      total: 10,
      takenAt: '2026-05-12T08:06:00.000Z',
    });
    expect(attempts.quizAttempts.at(-1)?.correct).toBe(2);
  });
});

describe('progress storage', () => {
  it('saves and loads progress from storage', () => {
    const storage = new Map<string, string>();
    const progress = toggleChapterComplete(createDefaultProgress(), 'test-tools', '2026-05-12T09:00:00.000Z');

    saveProgress(progress, {
      setItem: (key, value) => storage.set(key, value),
      getItem: (key) => storage.get(key) ?? null,
    });

    expect(
      loadProgress({
        getItem: (key) => storage.get(key) ?? null,
      }),
    ).toEqual(progress);
  });

  it('reads and writes progress using a caller-provided storage key', () => {
    const storage = new Map<string, string>();
    const key = 'custom-pack-progress';
    const progress = toggleChapterComplete(createDefaultProgress(), 'fundamentals', '2026-05-12T10:00:00.000Z');

    saveProgress(
      progress,
      {
        setItem: (storageKey, value) => storage.set(storageKey, value),
        getItem: (storageKey) => storage.get(storageKey) ?? null,
      },
      key,
    );

    expect(storage.has(key)).toBe(true);

    expect(
      loadProgress(
        {
          getItem: (storageKey) => storage.get(storageKey) ?? null,
        },
        key,
      ),
    ).toEqual(progress);
  });

  it('returns default progress when completedChapterIds is not an array', () => {
    const loaded = loadProgress({
      getItem: () => '{"completedChapterIds":"oops","quizAttempts":[]}',
    });

    expect(loaded).toEqual(createDefaultProgress());
  });

  it('returns default progress when quizAttempts is not an array', () => {
    const loaded = loadProgress({
      getItem: () => '{"completedChapterIds":[],"quizAttempts":42}',
    });

    expect(loaded).toEqual(createDefaultProgress());
  });

  it('returns default progress when saved JSON is invalid', () => {
    const loaded = loadProgress({
      getItem: () => '{invalid json',
    });

    expect(loaded).toEqual(createDefaultProgress());
  });

  it('returns default progress when browser storage throws while reading', () => {
    const loaded = loadProgress({
      getItem: () => {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });

    expect(loaded).toEqual(createDefaultProgress());
  });

  it('does not throw when browser storage rejects writes', () => {
    expect(() =>
      saveProgress(createDefaultProgress(), {
        getItem: () => null,
        setItem: () => {
          throw new DOMException('Full', 'QuotaExceededError');
        },
      }),
    ).not.toThrow();
  });
});

describe('sanitizeProgress', () => {
  it('resets progress from another knowledge pack identity', () => {
    const progress: LearnerProgress = {
      packId: 'older-pack',
      schemaVersion: 1,
      completedChapterIds: ['fundamentals'],
      quizAttempts: [
        {
          mode: 'practice',
          correct: 4,
          total: 5,
          takenAt: '2026-05-12T08:00:00.000Z',
        },
      ],
      cardStates: { 'flash-1': { box: 2, seen: 3 } },
      lastStudiedAt: '2026-05-12T08:00:00.000Z',
    };

    expect(
      sanitizeProgress(progress, {
        packId: 'current-pack',
        schemaVersion: 1,
        validChapterIds: ['fundamentals'],
      }),
    ).toEqual({
      packId: 'current-pack',
      schemaVersion: 1,
      completedChapterIds: [],
      quizAttempts: [],
      cardStates: {},
      lastStudiedAt: undefined,
    });
  });

  it('filters invalid chapter ids and malformed quiz attempts for the current pack', () => {
    const progress = {
      packId: 'current-pack',
      schemaVersion: 2,
      completedChapterIds: ['fundamentals', 'legacy-chapter'],
      quizAttempts: [
        {
          mode: 'exam',
          correct: 26,
          total: 40,
          takenAt: '2026-05-12T08:00:00.000Z',
        },
        {
          mode: 'practice',
          correct: 8,
          total: 5,
          takenAt: '2026-05-12T08:10:00.000Z',
        },
        {
          mode: 'practice',
          correct: 1,
          total: 5,
          takenAt: 'not-a-date',
        },
      ],
      cardStates: {
        'flash-keep': { box: 1, seen: 2 },
        'flash-bad': { box: 99, seen: 0 } as unknown as { box: number; seen: number },
      },
      lastStudiedAt: 'not-a-date',
    } satisfies LearnerProgress;

    expect(
      sanitizeProgress(progress, {
        packId: 'current-pack',
        schemaVersion: 2,
        validChapterIds: ['fundamentals'],
      }),
    ).toEqual({
      packId: 'current-pack',
      schemaVersion: 2,
      completedChapterIds: ['fundamentals'],
      quizAttempts: [
        {
          mode: 'exam',
          correct: 26,
          total: 40,
          takenAt: '2026-05-12T08:00:00.000Z',
        },
      ],
      cardStates: { 'flash-keep': { box: 1, seen: 2 } },
      lastStudiedAt: undefined,
    });
  });

  it('ignores non-object quiz attempts from arbitrary saved JSON', () => {
    const progress = {
      packId: 'current-pack',
      schemaVersion: 2,
      completedChapterIds: [],
      quizAttempts: [
        null,
        42,
        'bad-attempt',
        {
          mode: 'practice',
          correct: 3,
          total: 5,
          takenAt: '2026-05-12T08:00:00.000Z',
        },
      ],
    } as unknown as LearnerProgress;

    expect(
      sanitizeProgress(progress, {
        packId: 'current-pack',
        schemaVersion: 2,
        validChapterIds: ['fundamentals'],
      }).quizAttempts,
    ).toEqual([
      {
        mode: 'practice',
        correct: 3,
        total: 5,
        takenAt: '2026-05-12T08:00:00.000Z',
      },
    ]);
  });
});
