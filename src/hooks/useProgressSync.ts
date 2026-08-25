import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { ProgressDomain, SyllabusContent } from '../knowledge/types';
import type { ChapterId } from '../lib/quiz';
import {
  createDefaultProgress,
  loadProgress,
  sanitizeProgress,
  saveProgress,
  type LearnerProgress,
  type WritableStorage,
} from '../lib/progress';

function defaultStorage(): WritableStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

export type ProgressSyncFacade = ProgressDomain & Pick<SyllabusContent, 'syllabusChapters'>;

export function useProgressSync<TChapterId extends string = string>(
  pack: ProgressSyncFacade,
  storage: WritableStorage | null = defaultStorage(),
): [LearnerProgress<TChapterId>, Dispatch<SetStateAction<LearnerProgress<TChapterId>>>] {
  const metadata = {
    packId: pack.progress.packId,
    schemaVersion: pack.progress.schemaVersion,
  };

  const [progress, setProgress] = useState<LearnerProgress<TChapterId>>(() => {
    if (!storage) {
      return createDefaultProgress<TChapterId>(metadata);
    }

    const loaded = loadProgress<TChapterId>(storage, pack.progress.storageKey);
    return sanitizeProgress(loaded, {
      ...metadata,
      validChapterIds: pack.syllabusChapters.map(
        (chapter) => chapter.id as ChapterId<TChapterId>,
      ),
    });
  });

  /**
   * Whether storage already held an entry when this hook mounted.
   *
   * Lazily evaluated through `useState` rather than `useRef`, whose initial-value
   * expression would be re-evaluated (and re-read storage) on every render.
   */
  const [hadStoredEntryOnMount] = useState(
    () => storage !== null && storage.getItem(pack.progress.storageKey) !== null,
  );
  const mountWriteSkipped = useRef(false);

  useEffect(() => {
    if (!storage) {
      return;
    }

    // Don't create an entry on behalf of a visitor who opened the page and did nothing —
    // "no account, nothing stored until you study" should be literally true. This skips
    // only the very first write, and only when storage was empty: with nothing loaded,
    // sanitizing produced a pristine default, so there is no user data to lose by
    // waiting. An entry that *was* there is a different matter — a corrupted one has to
    // be rewritten clean on boot, which is what progress-recovery depends on.
    if (!hadStoredEntryOnMount && !mountWriteSkipped.current) {
      mountWriteSkipped.current = true;
      return;
    }

    saveProgress(progress, storage, pack.progress.storageKey);
  }, [progress, storage, pack.progress.storageKey, hadStoredEntryOnMount]);

  return [progress, setProgress];
}
