import type { Page } from '@playwright/test';
import { knowledgePack } from '../../src/knowledge/currentKnowledgePack';
import type { LearnerProgress } from '../../src/lib/progress';

const PROGRESS_STORAGE_KEY = knowledgePack.progress.storageKey;

/**
 * Ordering note: the `clearedProgress` auto-fixture registers an init script that
 * removes the storage key on the first navigation. An init script registered from a
 * test body runs *after* it, so seeding wins. Do not reorder the two.
 */

/** Seeds well-formed stored progress before the app boots. */
export async function seedProgress(
  page: Page,
  progress: Partial<LearnerProgress>,
): Promise<void> {
  await seedRawProgress(page, JSON.stringify(progress));
}

/**
 * Seeds an arbitrary raw string under the progress key — the lever for the
 * malformed-JSON cases that `loadProgress` has to survive.
 */
export async function seedRawProgress(page: Page, value: string): Promise<void> {
  await page.addInitScript(
    ([key, raw]) => {
      // Seed once, on the first navigation only. An init script runs on *every*
      // navigation, so without this sentinel a reload would restore the seeded payload
      // over whatever the test just did — silently undoing the behaviour under test.
      // (Same mechanism as the `clearedProgress` fixture, and deliberately a separate
      // sentinel so the two stay independent.)
      if (window.sessionStorage.getItem('__e2e_progress_seeded')) {
        return;
      }
      window.sessionStorage.setItem('__e2e_progress_seeded', '1');
      window.localStorage.setItem(key, raw);
    },
    [PROGRESS_STORAGE_KEY, value] as const,
  );
}

/** The metadata a stored payload needs for `sanitizeProgress` to accept it as current. */
export const CURRENT_PROGRESS_METADATA = {
  packId: knowledgePack.progress.packId,
  schemaVersion: knowledgePack.progress.schemaVersion,
} as const;
