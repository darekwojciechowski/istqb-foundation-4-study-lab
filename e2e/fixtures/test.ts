import { test as base, expect } from '@playwright/test';
import { knowledgePack } from '../../src/knowledge/currentKnowledgePack';
import { AppPage } from '../pages/AppPage';
import { FlashcardDeckPage } from '../pages/FlashcardDeckPage';
import { QuizPanelPage } from '../pages/QuizPanelPage';
import { StudyPathPage } from '../pages/StudyPathPage';

const PROGRESS_STORAGE_KEY = knowledgePack.progress.storageKey;

export interface StudyLabFixtures {
  clearedProgress: void;
  pageErrorGuard: void;
  app: AppPage;
  quiz: QuizPanelPage;
  flashcards: FlashcardDeckPage;
  studyPath: StudyPathPage;
}

export const test = base.extend<StudyLabFixtures>({
  clearedProgress: [
    async ({ page }, use) => {
      // Intent: wipe stored progress once, on the first navigation of each test, then
      // leave later in-test reloads untouched so the persistence specs keep their state.
      // (Mechanism: a sessionStorage sentinel — sessionStorage survives reloads but is
      // scoped to the per-test browser context, so the clear runs exactly once per test.)
      await page.addInitScript((key) => {
        if (!window.sessionStorage.getItem('__e2e_progress_cleared')) {
          window.localStorage.removeItem(key);
          window.sessionStorage.setItem('__e2e_progress_cleared', '1');
        }
      }, PROGRESS_STORAGE_KEY);

      await use();
    },
    { auto: true },
  ],

  // Fails the test on any uncaught exception in the page. Deliberately scoped to
  // `pageerror` and not `console`: specs that feed the app hostile localStorage
  // expect console.error output from the recovery paths, and that is not a failure.
  pageErrorGuard: [
    async ({ page }, use) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (error) => pageErrors.push(error));

      await use();

      expect(
        pageErrors.map((error) => error.message),
        'the page must not raise uncaught exceptions',
      ).toEqual([]);
    },
    { auto: true },
  ],

  app: async ({ page }, use) => {
    await use(new AppPage(page));
  },

  quiz: async ({ page }, use) => {
    await use(new QuizPanelPage(page));
  },

  flashcards: async ({ page }, use) => {
    await use(new FlashcardDeckPage(page));
  },

  studyPath: async ({ page }, use) => {
    await use(new StudyPathPage(page));
  },
});

export { expect };
