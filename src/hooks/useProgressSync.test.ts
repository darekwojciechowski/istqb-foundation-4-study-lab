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

  it('swallows QuotaExceededError when persisting', () => {
    const storage = {
      getItem: vi.fn(() => null),
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
      getItem: vi.fn(() => null),
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
