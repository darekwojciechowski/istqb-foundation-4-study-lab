import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
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

  useEffect(() => {
    if (!storage) {
      return;
    }
    saveProgress(progress, storage, pack.progress.storageKey);
  }, [progress, storage, pack.progress.storageKey]);

  return [progress, setProgress];
}
