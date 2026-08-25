import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useProgressSync, type ProgressSyncFacade } from './useProgressSync';
import type { LearnerProgress } from '../lib/progress';
import { makeChapter } from '../test/factories';

function makeFacade(): ProgressSyncFacade {
  return {
    progress: { storageKey: 'test-key', packId: 'test-pack', schemaVersion: 1 },
    syllabusChapters: [
      makeChapter({ id: 'ch-1', order: 1, title: 'Chapter 1' }),
      makeChapter({ id: 'ch-2', order: 2, title: 'Chapter 2', weight: { expectedQuestions: 5, percentage: 20 } }),
    ] as const,
  };
}

function inMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  return {
    store,
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

describe('useProgressSync', () => {
  it('returns a default progress when storage has no entry', () => {
    const storage = inMemoryStorage();
    const { result } = renderHook(() => useProgressSync(makeFacade(), storage));
    const [progress] = result.current;

    expect(progress.completedChapterIds).toEqual([]);
    expect(progress.quizAttempts).toEqual([]);
    expect(progress.packId).toBe('test-pack');
    expect(progress.schemaVersion).toBe(1);
  });

  it('hydrates from storage when a matching entry exists', () => {
    const saved: LearnerProgress = {
      packId: 'test-pack',
      schemaVersion: 1,
      completedChapterIds: ['ch-1'],
      quizAttempts: [
        { mode: 'practice', correct: 3, total: 5, takenAt: '2026-05-26T10:00:00.000Z' },
      ],
      cardStates: {},
      lastStudiedAt: '2026-05-26T10:00:00.000Z',
    };
    const storage = inMemoryStorage({ 'test-key': JSON.stringify(saved) });

    const { result } = renderHook(() => useProgressSync(makeFacade(), storage));
    const [progress] = result.current;

    expect(progress.completedChapterIds).toEqual(['ch-1']);
    expect(progress.quizAttempts).toHaveLength(1);
  });

  it('persists updates back to storage on change', () => {
    const storage = inMemoryStorage();
    const { result } = renderHook(() => useProgressSync(makeFacade(), storage));

    act(() => {
      const [, setProgress] = result.current;
      setProgress((current) => ({ ...current, completedChapterIds: ['ch-2'] }));
    });

    expect(storage.setItem).toHaveBeenCalled();
    const written = JSON.parse(storage.store.get('test-key')!) as LearnerProgress;
    expect(written.completedChapterIds).toEqual(['ch-2']);
  });

  // A visitor who opens the page and leaves should not have an entry written for them:
  // "no sign-in, nothing stored until you study" is part of what this app promises.
  it('writes nothing on mount when storage is empty', () => {
    const storage = inMemoryStorage();

    renderHook(() => useProgressSync(makeFacade(), storage));

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.store.has('test-key')).toBe(false);
  });

  it('starts persisting as soon as progress actually changes', () => {
    const storage = inMemoryStorage();
    const { result } = renderHook(() => useProgressSync(makeFacade(), storage));

    act(() => {
      const [, setProgress] = result.current;
      setProgress((current) => ({ ...current, completedChapterIds: ['ch-1'] }));
    });

    const written = JSON.parse(storage.store.get('test-key')!) as LearnerProgress;
    expect(written.completedChapterIds).toEqual(['ch-1']);
  });

  // The counterpart to the skip above: an entry that already exists must still be
  // rewritten in sanitized form on mount, which is how corrupted storage recovers.
  it('rewrites an existing entry on mount so corrupted storage is repaired', () => {
    const storage = inMemoryStorage({ 'test-key': '{ not json' });

    renderHook(() => useProgressSync(makeFacade(), storage));

    const written = JSON.parse(storage.store.get('test-key')!) as LearnerProgress;
    expect(written.packId).toBe('test-pack');
    expect(written.completedChapterIds).toEqual([]);
    expect(written.quizAttempts).toEqual([]);
  });

  it('swallows QuotaExceededError when persisting', () => {
    const storage = {
      // Non-empty storage, so the mount write this test is about actually happens.
      getItem: vi.fn(() => '{}'),
      setItem: vi.fn(() => {
        const error = new Error('quota');
        (error as Error & { name: string }).name = 'QuotaExceededError';
        throw error;
      }),
    };

    expect(() => renderHook(() => useProgressSync(makeFacade(), storage))).not.toThrow();
    expect(storage.setItem).toHaveBeenCalled();
  });

  it('rethrows non-quota errors when persisting', () => {
    const storage = {
      getItem: vi.fn(() => '{}'),
      setItem: vi.fn(() => {
        throw new Error('disk on fire');
      }),
    };

    expect(() => renderHook(() => useProgressSync(makeFacade(), storage))).toThrow('disk on fire');
  });

  it('falls back to default progress when storage is null', () => {
    const { result } = renderHook(() => useProgressSync(makeFacade(), null));
    const [progress] = result.current;
    expect(progress.completedChapterIds).toEqual([]);
    expect(progress.packId).toBe('test-pack');
  });
});
