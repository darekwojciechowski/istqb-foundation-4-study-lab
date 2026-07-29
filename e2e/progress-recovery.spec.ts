import { CURRENT_PROGRESS_METADATA, seedProgress, seedRawProgress } from './fixtures/seed';
import { expect, test } from './fixtures/test';
import type { AppPage } from './pages/AppPage';
import { REQ } from './requirements';

/** The three read-outs that together mean "booted to a clean default state". */
async function expectCleanBoot(app: AppPage): Promise<void> {
  await expect(app.heading).toBeVisible();
  await expect(app.progressPill).toHaveText('0% complete');
  await expect(app.attemptItems).toHaveCount(0);
}

/**
 * Stored progress is untrusted input: it is JSON a user (or a stale release) can leave
 * behind in localStorage. `loadProgress` and `sanitizeProgress` are the trust boundary,
 * and these specs drive both across a real reload rather than in isolation — a boot
 * crash here would strand a learner behind a blank page with no obvious way back.
 *
 * The `pageErrorGuard` fixture carries half of each assertion: if recovery threw, the
 * test fails at teardown even when the DOM assertions below would have passed.
 */
test.describe('corrupted progress recovery', () => {
  test(
    'unparseable stored progress is discarded and the app boots clean',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.PROGRESS_RECOVERY }],
    },
    async ({ app, page }) => {
      await test.step('arrange: leave a truncated JSON payload in storage', async () => {
        await seedRawProgress(page, '{ not json');
      });

      await test.step('act: boot the app', async () => {
        await app.goto();
      });

      await test.step('assert: the app renders default progress', async () => {
        await expectCleanBoot(app);
      });
    },
  );

  test(
    'progress from a different pack or schema version is discarded',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.PROGRESS_RECOVERY }],
    },
    async ({ app, page, studyPath }) => {
      await test.step('arrange: seed a well-formed payload from a stale schema', async () => {
        await seedProgress(page, {
          packId: 'some-other-pack',
          schemaVersion: CURRENT_PROGRESS_METADATA.schemaVersion - 1,
          completedChapterIds: ['fundamentals'],
          quizAttempts: [{ mode: 'practice', correct: 5, total: 5, takenAt: new Date().toISOString() }],
          cardStates: {},
        });
      });

      await test.step('act: boot the app', async () => {
        await app.goto();
      });

      await test.step('assert: the stale completion and attempts are dropped', async () => {
        await expectCleanBoot(app);
        await expect(studyPath.chapterCard(0)).not.toContainText('Completed');
      });
    },
  );

  test(
    'garbage attempt and card-state entries are pruned from otherwise current progress',
    {
      tag: ['@critical'],
      annotation: [{ type: 'requirement', description: REQ.PROGRESS_RECOVERY }],
    },
    async ({ app, page, flashcards }) => {
      await test.step('arrange: seed current metadata carrying malformed collections', async () => {
        await seedProgress(page, {
          ...CURRENT_PROGRESS_METADATA,
          // Every entry below is individually invalid: an unknown chapter, three
          // attempt shapes that fail validation, and two out-of-range card states.
          completedChapterIds: ['no-such-chapter'],
          quizAttempts: [
            { mode: 'telepathy', correct: 1, total: 2, takenAt: new Date().toISOString() },
            { mode: 'practice', correct: 9, total: 2, takenAt: new Date().toISOString() },
            { mode: 'exam', correct: 1, total: 2, takenAt: 'not-a-date' },
          ] as never,
          cardStates: { 'card-a': { box: 99, seen: -3 }, 'card-b': null } as never,
          lastStudiedAt: 'also-not-a-date',
        });
      });

      await test.step('act: boot the app', async () => {
        await app.goto();
      });

      await test.step('assert: nothing malformed survives into the UI', async () => {
        await expectCleanBoot(app);
        // The pruned card states must not leak into the deck read-out either.
        await expect(flashcards.prompt).toBeVisible();
        await expect(flashcards.mastery).toContainText('0 /');
      });
    },
  );
});
